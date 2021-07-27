# Rust WebSocket Server
This WebSocket server is built off tokio-tungstenite. It passes messages to clients in the same room.

## Rooms
When clients connect to the server, they must provide a protocol to connect to that room. This is some example JS code:
```js
const socket = new WebSocket( //try connecting to the server
  "ws://localhost:8080",
  this.props.location.pathname.replace(/\//ig, "-") //pass the URL pathname as the protocol ('/' characters are replaced with '-')
)
```

## Development
```
cd server
cargo run
```

### Watch files to rebuild when you save
You can download ```cargo-watch``` run cargo commands every time you save a file (instead of manually shutting down the server then re-running ```cargo run```). To install, run
```
cargo install cargo-watch
```

Then you can run this command to watch and run your files:
```
cargo watch -x 'run'
```
