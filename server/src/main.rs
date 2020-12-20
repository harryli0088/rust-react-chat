//! A chat server that broadcasts a message to all connections.
//!
//! This is a simple line-based server which accepts WebSocket connections,
//! reads lines from those connections, and broadcasts the lines to all other
//! connected clients.
//!
//! You can test this out by running:
//!
//!     cargo run --example server 127.0.0.1:12345
//!
//! And then in another window run:
//!
//!     cargo run --example client ws://127.0.0.1:12345/
//!
//! You can run the second command in multiple windows and then chat between the
//! two, seeing the messages from the other client as they're received. For all
//! connected clients they'll all join the same room and see everyone else's
//! messages.

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
struct TestStruct {
    protocol: HeaderValue,
    sender: Sender,
}

type PeerMap = Arc<Mutex<HashMap<SocketAddr, TestStruct>>>;

use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct BroadcastJsonStruct {
    message: String,
    sender_addr: SocketAddr,
}


async fn handle_connection(peer_map: PeerMap, raw_stream: TcpStream, client_addr: SocketAddr) {
    println!("Incoming TCP connection from: {}, raw stream: {}", client_addr, raw_stream.local_addr().unwrap());
    let mut protocol = HeaderValue::from_static("");

    let copy_headers_callback = |request: &Request, mut response: Response| -> Result<Response, ErrorResponse> {
        for (name, value) in request.headers().iter() {
            println!("Name: {}, value: {}", name.to_string(), value.to_str().expect("expected a value"));
        }

        //access the protocol in the request, then set it in the response
        protocol = request.headers().get(SEC_WEBSOCKET_PROTOCOL).expect("the client should specify a protocol").to_owned();
        let owned_protocol = request.headers().get(SEC_WEBSOCKET_PROTOCOL).expect("the client should specify a protocol").to_owned();
        response.headers_mut().insert(SEC_WEBSOCKET_PROTOCOL, owned_protocol);
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
    peer_map.lock().unwrap().insert(client_addr, TestStruct {
        protocol: protocol.to_owned(),
        sender: sender,
    });

    //set up the incoming and outgoing
    let (outgoing, incoming) = ws_stream.split();

    let broadcast_incoming = incoming.try_for_each(|msg| {
        println!("Received a message from {}: {}", client_addr, msg.to_text().unwrap());
        let peers = peer_map.lock().unwrap();

        //make a new struct to be serialized
        let broadcast_data = BroadcastJsonStruct {
            message: msg.to_text().unwrap().to_owned(),
            sender_addr: client_addr.to_owned(),
        };
        let new_msg = Message::Text(
            serde_json::to_string(&broadcast_data).expect("problem serializing broadcast_data")
        );
        println!("New message {}", new_msg.to_text().unwrap());

        // We want to broadcast the message to everyone except ourselves.
        //filter returns addresses that aren't our current address
        let broadcast_recipients =
            peers.iter().filter(|(peer_addr, _)|
            peer_addr != &&client_addr
            && peers.get(peer_addr).expect("peer_addr should be a key in the HashMap").protocol.to_str().expect("expected a string")==protocol.to_str().expect("expected a string")
        ).map(|(_, ws_sink)| ws_sink);

        //send the message to all the recipients
        for recp in broadcast_recipients {
            recp.sender.unbounded_send(new_msg.clone()).unwrap();
        }

        future::ok(())
    });

    let receive_from_others = receiver.map(Ok).forward(outgoing);

    pin_mut!(broadcast_incoming, receive_from_others);
    future::select(broadcast_incoming, receive_from_others).await;

    println!("{} disconnected", &client_addr);
    peer_map.lock().unwrap().remove(&client_addr);
}

#[tokio::main]
async fn main() -> Result<(), IoError> {
    //see if there is a server address specified in the command line argument, else use default address
    let server_addr = env::args().nth(1).unwrap_or_else(|| "127.0.0.1:8080".to_string());

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
