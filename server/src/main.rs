//based off this example https://github.com/snapview/tokio-tungstenite/blob/master/examples/echo-server.rs

use std::{
    collections::HashMap,
    env,
    io::Error as IoError,
    net::SocketAddr,
    sync::{Arc, Mutex},
};

use futures_channel::mpsc::{unbounded, UnboundedSender};
use futures_util::{future, pin_mut, stream::TryStreamExt, StreamExt};

use tokio::net::{TcpListener, TcpStream};
use tungstenite::{
    protocol::Message,
    handshake::server::{Request, Response, ErrorResponse},
};
use http::header::{
    HeaderValue,
    SEC_WEBSOCKET_PROTOCOL,
};

type Sender = UnboundedSender<Message>;
struct PeerStruct {
    protocol: HeaderValue,
    sender: Sender,
}

type PeerMap = Arc<Mutex<HashMap<SocketAddr, PeerStruct>>>;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct BroadcastJsonStruct {
    message: String,
    sender_addr: SocketAddr,
    type_key: String,
}


async fn handle_connection(peer_map: PeerMap, raw_stream: TcpStream, client_addr: SocketAddr) {
    println!("Incoming TCP connection from: {}, raw stream: {}", client_addr, raw_stream.local_addr().unwrap());


    /* SET UP THE WEBSOCKET CONNECTION */

    //instead of routing, this server manages chat rooms usign the protocol argument specified from the client
    //ie in JavaScript: new WebSocket("ws://localhost:8080", protocol)
    let mut protocol = HeaderValue::from_static("");
    let copy_headers_callback = |request: &Request, mut response: Response| -> Result<Response, ErrorResponse> {
        // for (name, value) in request.headers().iter() {
        //     println!("Name: {}, value: {}", name.to_string(), value.to_str().expect("expected a value"));
        // }

        //access the protocol in the request, then save it to use outside the closure
        protocol = request.headers().get(SEC_WEBSOCKET_PROTOCOL).expect("the client should specify a protocol").to_owned();
        // println!("PROTOCOL {:?}",protocol.to_owned().to_str()); //print the protocol
        //set the protocol in the response, which is necessary to successfully create the connection
        response.headers_mut().insert(SEC_WEBSOCKET_PROTOCOL, protocol.to_owned());
        Ok(response)
    };

    //accept a new asynchronous WebSocket connection
    let ws_stream = tokio_tungstenite::accept_hdr_async(
        raw_stream,
        copy_headers_callback,
    )
    .await
    .expect("Error during the websocket handshake occurred");
    println!("WebSocket connection established: {}", client_addr);

    // Insert the write part of this peer to the peer map.
    let (sender, receiver) = unbounded();
    peer_map.lock().unwrap().insert(client_addr, PeerStruct {
        protocol: protocol.to_owned(),
        sender: sender,
    });


    //this function is used to broadcast a message and type to all the other connected clients
    let broadcast_to_other_clients = |message:String, type_key: String| {
        let peers = peer_map.lock().unwrap();

        //make a new struct to be serialized
        let broadcast_data = BroadcastJsonStruct {
            message,
            sender_addr: client_addr.to_owned(),
            type_key,
        };
        let new_msg = Message::Text(
            serde_json::to_string(&broadcast_data).expect("problem serializing broadcast_data")
        );
        println!("New message {}", new_msg.to_text().unwrap());

        //filter addresses that aren't the message sender's address AND are using the same protocol
        let broadcast_recipients = peers.iter().filter(
            |(peer_addr, _)|
            peer_addr != &&client_addr //this client is not this sender
            && ( //this client's protocol is the same as this sender's
                peers.get(peer_addr).expect("peer_addr should be a key in the HashMap").protocol.to_str().expect("expected a string")
                == protocol.to_str().expect("expected a string")
            )
        ).map(|(_, ws_sink)| ws_sink);

        //send the message to all the recipients
        for recp in broadcast_recipients {
            recp.sender.unbounded_send(new_msg.clone()).unwrap();
        }
    };




    /* SUCCESSFULL CONNECTED */

    //tell everyone we've connected
    broadcast_to_other_clients(format!("{} has connected", client_addr.to_owned()).to_owned(), "meta".to_owned());




    /* WAITING FOR MESSAGES */

    //set up the incoming and outgoing
    let (outgoing, incoming) = ws_stream.split();
    //this function receives incoming messages and tries to broadcast them to the other clients
    let broadcast_incoming = incoming.try_for_each(|msg| {
        println!("Received a message from {}: {}", client_addr, msg.to_text().unwrap());

        broadcast_to_other_clients(msg.to_text().unwrap().to_owned(), "user".to_owned());

        future::ok(())
    });
    let receive_from_others = receiver.map(Ok).forward(outgoing);
    pin_mut!(broadcast_incoming, receive_from_others);
    future::select(broadcast_incoming, receive_from_others).await;




    /* DISCONNECTING */

    //tell everyone we're disconnecting
    broadcast_to_other_clients(format!("{} has disconnected", client_addr.to_owned()).to_owned(), "meta".to_owned());

    //remove this client from the peer map
    let mut peers_disconnect = peer_map.lock().unwrap();
    println!("{} DISCONNECTED---------------------------", &client_addr);
    peers_disconnect.remove(&client_addr);
}

#[tokio::main]
async fn main() -> Result<(), IoError> {
    // Get the port number to listen on (required for heroku deployment).
    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let server_addr = format!("0.0.0.0:{}", port);

    let state = PeerMap::new(Mutex::new(HashMap::new()));

    // Create the event loop and TCP listener we'll accept connections on.
    let try_socket = TcpListener::bind(&server_addr).await; //create the server on the address
    let listener = try_socket.expect("Failed to bind");
    println!("Listening on: {}", server_addr);

    // Let's spawn the handling of each connection in a separate task.
    while let Ok((stream, client_addr)) = listener.accept().await {
        tokio::spawn(handle_connection(state.clone(), stream, client_addr));
    }

    Ok(())
}
