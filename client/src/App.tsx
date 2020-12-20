import React from 'react';
import logo from './logo.svg';
import './App.css';

type MessageType = {
  message: string,
  sender_addr: string,
}

interface State {
  input: string,
  messages: MessageType[],
  newRoom: string,
  socketReadyState: number,
}

class App extends React.Component<{},State> {
  socket: WebSocket

  constructor(props:{}) {
    super(props)

    this.state = {
      input: "",
      messages: [],
      newRoom: "",
      socketReadyState: -1,
    }

    this.socket = this.setUpSocket()
  }

  componentWillUnmount() {
    this.socket.close()
  }

  setUpSocket = () => {
    console.log("I RUN")
    const socket = new WebSocket("ws://localhost:8080", window.location.pathname.replace(/\//ig, "-"))
    socket.onopen = () => {
      console.log("OPEN RUNS")
      this.setState({socketReadyState: socket.readyState})
    }

    socket.onmessage = (message:MessageEvent<any>) => {
      console.log("MESSAGE", message)

      try {
        const data = JSON.parse(message.data) as MessageType

        this.setState({
          messages: this.state.messages.concat(data),
          socketReadyState: socket.readyState,
        })
      }
      catch(err) {
        console.error(err)
      }

    }

    socket.onclose = () => {
      console.log("CLOSE")
      this.setState({socketReadyState: socket.readyState})
    }

    return socket
  }

  getConnectionStatus = () => {
    switch(this.state.socketReadyState) {
      case 0:
        return "Connecting"
      case 1:
        return "Connected"
      case 2:
        return "Closing"
      default:
        return "Closed"
    }
  }

  onChatSubmit = (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    this.socket.send(this.state.input)
    this.setState({
      input: "",
      messages: this.state.messages.concat({
        message: this.state.input,
        sender_addr: "self",
      }),
    })
  }

  onNewRoomSubmit = (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    window.location.href = `${window.location.origin}/${this.state.newRoom}`;
  }

  render() {
    return (
      <div className="App">
        <div>{this.getConnectionStatus()}</div>
        <br/>
        <div>
          {this.state.messages.map((m,i) =>
            <div key={i}>{m.sender_addr}: {m.message}</div>
          )}
        </div>

        <form id="chat-form" onSubmit={this.onChatSubmit}>
          <div><input value={this.state.input} onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setState({input: e.target.value})}/></div>

          <button type="submit" disabled={this.state.socketReadyState !== 1}>Send</button>
        </form>

        <hr/>

        <form id="new-room-form" onSubmit={this.onNewRoomSubmit}>
          <label htmlFor="new-room-input">Current Room: {window.location.pathname}</label>
          <div><input id="new-room-input" value={this.state.newRoom} onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setState({newRoom: e.target.value})}/></div>

          <button type="submit">Go to New Room</button>
        </form>
      </div>
    );
  }
}

export default App;
