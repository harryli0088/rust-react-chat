use std::{net::TcpListener, thread::spawn};

use tungstenite::{
    accept_hdr,
    handshake::server::{Request, Response},
};

//built off this example https://github.com/snapview/tungstenite-rs/blob/master/examples/server.rs
fn main() {
    // env_logger::init();
    let server = TcpListener::bind("127.0.0.1:8080").unwrap(); //create the server
    for stream in server.incoming() { //iterate over incoming connections
        spawn(move || { //spawn a new thread
            let callback = |req: &Request, mut response: Response| {
                println!("Received a new ws handshake");
                let path = req.uri().path(); //get the requested path trailing after the domain and port, ex: "/abcde"
                println!("The request's path is: {}", path);
                println!("The request's headers are:");
                for (ref header, _value) in req.headers() { //iterate over the headers
                    println!("* {}", header);
                }

                // Let's add an additional header to our response to the client.
                let headers = response.headers_mut();
                headers.append("MyCustomHeader", ":)".parse().unwrap());
                headers.append("SOME_TUNGSTENITE_HEADER", "header_value".parse().unwrap());

                Ok(response) //send an Ok response
            };

            //set up the websocket connection
            let mut websocket = accept_hdr(stream.unwrap(), callback).unwrap();

            loop { //infinite loop acts as onmessage listener
                let msg = websocket.read_message().unwrap(); //get the message
                if msg.is_binary() || msg.is_text() {
                    websocket.write_message(msg).unwrap();
                }
            }
        });
    }
}
