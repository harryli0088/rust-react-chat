import React from 'react'
import { withRouter, RouteComponentProps } from "react-router"

import clientPackage from "../package.json"
import encrypt from 'utils/crypto/encrypt'
import genKeys from 'utils/crypto/genKeys'
import {
  EncryptedRecvType,
  EncryptedSendType,
  MetaEnum,
  MetaRecvType,
  PlaintextRecvType,
  PlaintextSendType,
  PublicKeyRecvType,
  PublicKeySendType,
  SenderDataType } from 'utils/types'
import deriveKey from 'utils/crypto/deriveKey'
import decrypt from 'utils/crypto/decrypt'

import Chat, { ChatType, ChatTypeType } from "Components/Chat/Chat"

import github from "github.svg"
import 'App.scss'
import DisplaySender from 'Components/DisplaySender/DisplaySender'

type Props = RouteComponentProps

interface State {
  encrypt: boolean,
  input: string,
  chats: ChatType[],
  newRoom: string,
  socketReadyState: number,
}

const WS_SERVER_URL = process.env.REACT_APP_WS_SERVER_URL || "ws://localhost:8080"



class App extends React.Component<Props,State> {

  senderData: { //this maps the sender address to the sender's data (public and derived keys)
    [senderAddr:string]: SenderDataType
  } = {}

  //meta data trackers used to determine when to show gray label text
  lastDate: Date = new Date()
  lastSenderAddr: string = ""
  lastType: string = ""

  pingInterval: number = -1 //pinging is important to keep WebSocket connections alive when using AWS Elastic Beanstalk
  privateKeyJwk: JsonWebKey
  publicKeyJwk: JsonWebKey
  publicKeyQueue: PublicKeyRecvType[] = []
  socket: WebSocket //socket connected to the chat server

  constructor(props:Props) {
    super(props)

    this.state = {
      encrypt: true,
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

    //The constructor is run twice in strict mode in development, but I don't want to set up these values yet
    //https://reactjs.org/docs/strict-mode.html#detecting-unexpected-side-effects
    //@ts-ignore
    this.privateKeyJwk = null
    //@ts-ignore
    this.socket = null
    //@ts-ignore
    this.publicKeyJwk = null
  }

  componentDidMount() {
    this.socket = this.setUpSocket()
  }

  componentDidUpdate(prevProps:Props) {
    //if the URL (ie the room) has changed
    if(prevProps.location.pathname !== this.props.location.pathname) {
      this.socket.close() //close the current socket connection
      this.socket = this.setUpSocket() //then open up a new one for the new URL
    }
  }

  componentWillUnmount() {
    this.socket.close()
  }

  send = (obj: Object) => {
    this.socket.send(JSON.stringify(obj))
  }

  getPublicKeySend = ():PublicKeySendType => ({public_key: this.publicKeyJwk})

  setUpSocket = () => {
    this.setState({socketReadyState: 0}) //mark that we are making a new WebSocket connection
    const socket = new WebSocket( //try connecting to the server
      WS_SERVER_URL,
      this.props.location.pathname.replace(/\//ig, "-") //pass the URL pathname as the protocol ('/' characters are replaced with '-')
    )

    socket.onopen = () => {
      genKeys().then(({publicKeyJwk, privateKeyJwk}) => {
        this.publicKeyJwk = publicKeyJwk
        this.privateKeyJwk = privateKeyJwk
        this.send(this.getPublicKeySend()) //broadcast the public key

        this.publicKeyQueue.forEach(this.processPublicKey) //process any outstanding public keys
      })
      

      this.addChat(<span>You have joined the chat room <span className="blob">{this.props.location.pathname}</span></span>, "self", "meta")
      this.setState({socketReadyState: socket.readyState}) //mark the new socket state
      clearInterval(this.pingInterval) //clear the previous interval
      this.pingInterval = window.setInterval(this.ping, 30000) //set up an interval to ping the server
    }

    socket.onmessage = async (message:MessageEvent<any>) => {
      // console.log("MESSAGE", message)
      try {
        const parsed = JSON.parse(message.data) //try parsing the message as JSON
        await this.addChatFromSocket(parsed) //add this message to state
      }
      catch(err) {
        console.error("TESTING",err)
      }
    }

    socket.onclose = () => {
      this.setState({socketReadyState: socket.readyState})
    }

    return socket
  }

  ping = () => this.socket.send("") //send empty string

  addChatFromSocket = async (obj: Object) => {
    //TODO validate schema
    if(obj.hasOwnProperty("cipher")) { //if this is an encrypted message
      const message = obj as EncryptedRecvType

      this.addChat(
        [
          message.cipher,
          message.initialization_vector,
          await decrypt(message, this.senderData[message.sender_addr].derivedKey)
        ],
        message.sender_addr,
        "encrypted"
      ) //add the chat to state

      //TODO queue?
    }
    else if(obj.hasOwnProperty("meta")) { //if this is a meta broadcast
      const message = obj as MetaRecvType

      const connected = message.meta===MetaEnum.connected
      this.addChat( //add the chat to state
        `Client ${message.sender_addr} ${connected?"":"dis"}connected`,
        message.sender_addr, 
        "meta"
      )

      if(connected) { //if this client just connected
        this.send(this.getPublicKeySend()) //broadcast the public key, TODO targeted send
      }
      else {
        delete this.senderData[message.sender_addr] //delete this client's key data
      }
    }
    else if(obj.hasOwnProperty("plaintext")) { //if this is a plaintext broadcast
      const message = obj as PlaintextRecvType

      this.addChat(message.plaintext, message.sender_addr, "plaintext") //add the chat to state
    }
    else if(obj.hasOwnProperty("public_key")) { //if this is a public key broadcast
      const message = obj as PublicKeyRecvType

      if(this.privateKeyJwk) { //if my private key is ready
        await this.processPublicKey(message)
      }
      else { //else I need to wait for my private key to finish generating
        this.publicKeyQueue.push(message) //save this message to be processed later
      }
    }
    else {
      console.warn("Unexpected message type", obj)
    }

    this.setState({ //update the socket state
      socketReadyState: this.socket.readyState,
    })
  }

  processPublicKey = async (message: PublicKeyRecvType) => {
    const public_key = message.public_key //get the public key
    this.senderData[message.sender_addr] = { //assign the data to this sender
      derivedKey: await deriveKey(public_key, this.privateKeyJwk), //derive the symmetric key
      publicKeyJwk: public_key, //record the public key
    }

    this.addChat( //add the chat to state
      `Received Client ${message.sender_addr}'s public key`,
      message.sender_addr, 
      "meta"
    )
  }

  addChat = (content: React.ReactNode, senderAddr:string, type: ChatTypeType) => {
    const date = new Date()
    const chat:ChatType = {
      content,
      date,
      senderAddr,
      showSenderAddr: ( //whether we should show the sender addr
        this.lastSenderAddr !== senderAddr //if this sender is different
        || this.lastType !== type //if the message type is different
      ),
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

    const input = this.state.input.trim() //trim the input of any white space
    if(input) { //if there is input to send
      if(this.state.encrypt) { //if we want to encrypt
        Object.entries(this.senderData).forEach(async ([senderAddr,keys]) => { //encrypt the message for all recipients
          const content:EncryptedSendType = {
            ...(await encrypt(input, keys.derivedKey)), //encrypt the data
            recv_addr: senderAddr //specify the intended recipient
          }
          this.send(content) //send the chat to the socket
        })
      }
      else {
        const content:PlaintextSendType = { plaintext: input }
        this.send(content) //send the chat to the socket
      }


      this.addChat(input, "self", "self") //add this chat to state

      this.setState({ input: "" }) //clear the input
    }
  }

  onNewRoomSubmit = (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const newRoomURI = encodeURIComponent(this.state.newRoom) //URI encode the inputed string

    this.props.history.push(newRoomURI) //go to the new URL (ie change rooms)
  }

  render() {
    const connectionStatus = this.getConnectionStatus()
    
    const senderDataEntries = Object.entries(this.senderData)

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

          <h2>End-to-End Encrypted React - Rust Chat App</h2>
          <p>Version {clientPackage.version}</p>
          <p>I created this chat room prototype to learn how to use Rust and about end-to-end encryption.</p>
          <p id="disclaimer"><b>DISCLAIMER:</b> This is probably not a cyrptographically secure system and has not been validated by security professionals. This is simply a side project for me to learn about end-to-end encryption.</p>
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
            <h3>Connected Clients</h3>
            
            {
              senderDataEntries.length > 0
              ? (
                senderDataEntries.map(([senderAddr, {publicKeyJwk, derivedKey}]) =>
                  <DisplaySender key={senderAddr} derivedKey={derivedKey} publicKeyJwk={publicKeyJwk} senderAddr={senderAddr}/>
                )
              ) : <div>There are no other connected clients</div>
            }
          </div>

          <hr/>

          <h3>Rust Overview</h3>
          <p>The Rust server features include:</p>
          <ul>
            <li>WebSocket server</li>
            <li>Chat rooms via routes (via WebSocket protocol)</li>
            <li>Alerts when a client connects or disconnects</li>
            <li>Broadcast or targeted messages</li>
          </ul>

          <hr/>

          <h3>End-to-End Encryption Overview</h3>


          <p>Intro</p>
          <p>Key Generation</p>
          <p>Public Key Broadcasting</p>
          <p>Encryption/Decryption</p>
          <p>Message Integrity</p>
          <p>Out-of-band Verification</p>

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
