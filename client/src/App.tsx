import React from 'react'
import Chat, { ChatType } from "Components/Chat/Chat"
import github from "github.svg"
import { withRouter, RouteComponentProps } from "react-router"
import clientPackage from "../package.json"
import 'App.scss'

type Props = RouteComponentProps

interface State {
  input: string,
  chats: ChatType[],
  newRoom: string,
  socketReadyState: number,
}

const WS_SERVER_URL = process.env.REACT_APP_WS_SERVER_URL || "ws://localhost:8080"

class App extends React.Component<Props,State> {
  lastDate: Date = new Date()
  lastSenderAddr: string = ""
  lastType: string = ""
  pingInterval: number = -1
  socket: WebSocket

  constructor(props:Props) {
    super(props)

    this.state = {
      input: "",
      chats: [
        // {
        //   content: "testing testing 123",
        //   date: new Date(),
        //   senderAddr: "tessdadfadfadfasfsdsdasfafdfafdfasfadt",
        //   showSenderAddr: true,
        //   type: "user",
        // },
        // {
        //   content: "testing testing 123",
        //   date: new Date(),
        //   senderAddr: "self",
        //   showSenderAddr: true,
        //   type: "user",
        // },
        // {
        //   content: "testing testing 123",
        //   date: new Date(),
        //   senderAddr: "self",
        //   showSenderAddr: false,
        //   type: "user",
        // },
        // {
        //   content: "testing testing 123",
        //   date: new Date(),
        //   senderAddr: "self",
        //   showSenderAddr: false,
        //   type: "user",
        // },
      ],
      newRoom: "",
      socketReadyState: 0,
    }

    this.socket = this.setUpSocket()
  }

  componentDidUpdate(prevProps:Props) {
    if(prevProps.location.pathname !== this.props.location.pathname) {
      this.socket.close()
      this.socket = this.setUpSocket()
    }
  }

  componentWillUnmount() {
    this.socket.close()
  }

  setUpSocket = () => {
    this.setState({socketReadyState: 0})
    const socket = new WebSocket(WS_SERVER_URL, this.props.location.pathname.replace(/\//ig, "-"))
    socket.onopen = () => {
      this.addChat(<span>You have joined the chat room <span className="blob">{this.props.location.pathname}</span></span>, "self", "meta")
      this.setState({socketReadyState: socket.readyState})
      clearInterval(this.pingInterval)
      this.pingInterval = window.setInterval(this.ping, 30000)
    }

    socket.onmessage = (message:MessageEvent<any>) => {
      console.log("MESSAGE", message)

      try {
        const parsed = JSON.parse(message.data)
        this.addChatFromSocket(parsed.message, parsed.sender_addr, parsed.type_key)
      }
      catch(err) {
        console.error(err)
      }

    }

    socket.onclose = () => {
      this.setState({socketReadyState: socket.readyState})
    }

    return socket
  }

  ping = () => this.socket.send("")

  addChatFromSocket = (content: string, senderAddr:string, type: string) => {
    this.addChat(content, senderAddr, type) //add the chat to state

    this.setState({ //update the socket state
      socketReadyState: this.socket.readyState,
    })
  }

  addChat = (content: React.ReactNode, senderAddr:string, type: string) => {
    const date = new Date()
    const chat:ChatType = {
      content,
      date,
      senderAddr,
      showSenderAddr: this.lastSenderAddr !== senderAddr
      || this.lastType !== type, //set whether we should show the sender addr
      type,
    }

    //record last values
    this.lastDate = date
    this.lastSenderAddr = chat.senderAddr
    this.lastType = chat.type

    this.setState({ //add the chat to state
      chats: this.state.chats.concat(chat),
    })
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

  onChatTypeSubmit = (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const content = this.state.input.trim() //trim the input of any white space

    if(content) {
      this.socket.send(content) //send the chat to the socket

      this.addChat(content, "self", "user") //add this chat to state

      this.setState({ input: "" }) //clear the input
    }
  }

  onNewRoomSubmit = (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const newRoomURI = encodeURIComponent(this.state.newRoom)

    this.props.history.push(newRoomURI)
  }

  render() {
    const connectionStatus = this.getConnectionStatus()

    return (
      <div id="App">
        <div id="content">
          <div id="header" className="container">
            Current Room: <span  className="blob">{this.props.location.pathname}</span> <span className={`blob  ${connectionStatus}`}>{connectionStatus}</span>
          </div>

          <div id="chat-container" className="container">
            <div>
              {this.state.chats.map((m,i) =>
                <Chat key={i} {...m}/>
              )}
            </div>
          </div>

          <div id="chat-form-container">
            <form id="chat-form" onSubmit={this.onChatTypeSubmit}>
              <input
                autoFocus
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setState({input: e.target.value})}
                value={this.state.input}
              />

              <button type="submit" disabled={this.state.socketReadyState !== 1}>Send</button>
            </form>
          </div>
        </div>

        <div id="sidebar">
          <a id="github" href="https://github.com/harryli0088/rust-react-chat" target="_blank" rel="noopener noreferrer"><img src={github} alt="github repo"/></a>

          <h2>React - Rust Chat App</h2>
          <p>Version {clientPackage.version}</p>
          <p>I created this chat room prototype to learn how to use Rust. The Rust server features include:</p>
          <ul>
            <li>WebSocket server</li>
            <li>Chat rooms distinguished by route (via WebSocket protocol)</li>
            <li>Alerts when a client connects or disconnects</li>
          </ul>
          <p>(Note: Heroku free tier server takes several seconds to wake up from sleep mode)</p>

          <hr/>

          <form id="new-room-form" onSubmit={this.onNewRoomSubmit}>
            <br/>
            <label htmlFor="new-room-input">Change Rooms:</label>
            <div>
              <input
                id="new-room-input"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setState({newRoom: e.target.value})}
                placeholder="Enter a new room code"
                value={this.state.newRoom}
              />&nbsp;

              <button type="submit">Change</button>
            </div>
            <br/>
          </form>

          <hr/>

          <div>
		          <p>Built using <a href="https://reactjs.org/" target="_blank" rel="noopener noreferrer">React</a>, <a href="https://www.typescriptlang.org/" target="_blank" rel="noopener noreferrer">Typescript</a>, <a href="https://fontawesome.com/license" target="_blank" rel="noopener noreferrer">Font Awesome</a>, and <a href="https://www.rust-lang.org/" target="_blank" rel="noopener noreferrer">Rust</a></p>
		            <p><a href="https://github.com/harryli0088/rust-react-chat" target="_blank" rel="noopener noreferrer">Github Repo</a></p>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(App)
