import React from 'react';
import logo from './logo.svg';
import './App.css';

class App extends React.Component<{},{}> {
  socket: WebSocket

  constructor(props:{}) {
    super(props)

    this.socket = this.setUpSocket()
  }

  setUpSocket = () => {
    const socket = new WebSocket("ws://localhost:8080/testing")
    socket.onopen = () => {
      console.log("OPEN")
      socket.send("TESTING123")
    }

    socket.onmessage = (message:MessageEvent<any>) => {
      console.log("MESSAGE", message)
    }

    socket.onclose = () => {
      console.log("CLOSE")
    }

    return socket
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

export default App;
