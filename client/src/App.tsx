import React from 'react'
import { withRouter, RouteComponentProps } from "react-router"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCode, faDoorOpen, faKey, faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons'
import { faGithub, faRust } from '@fortawesome/free-brands-svg-icons'

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

import BlankAnchor from 'Components/BlankAnchor'
import Chat, { ChatType, ChatTypeType } from "Components/Chat/Chat"
import DisplaySender from 'Components/DisplaySender/DisplaySender'
import RenderKey from 'Components/RenderKey/RenderKey'
import RenderPrivateKey from 'Components/RenderPrivateKey/RenderPrivateKey'

import 'App.scss'

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
  //meta data trackers used to determine when to show gray label text
  lastDate: Date = new Date()
  lastSenderAddr: string = ""
  lastType: string = ""

  pingInterval: number = -1 //pinging is important to keep WebSocket connections alive when using AWS Elastic Beanstalk
  privateKeyJwk: JsonWebKey
  publicKeyJwk: JsonWebKey
  publicKeyQueue: PublicKeyRecvType[] = [] //we may receive public keys before our own keys have finished generating. push those public keys in here to process once we're ready
  senderData: { //this maps the sender address to the sender's data (public and derived keys)
    [senderAddr:string]: SenderDataType
  } = {}
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
    this.socket = this.setUpSocket() //set up the socket once we mount
  }

  componentDidUpdate(prevProps:Props) {
    //if the URL (ie the room) has changed
    if(prevProps.location.pathname !== this.props.location.pathname) {
      this.breakdownSocket() //break down the current connection
      this.socket = this.setUpSocket() //then open up a new one for the new URL
    }
  }

  componentWillUnmount() {
    this.breakdownSocket() //breakdown the connection before unmounting
  }

  /**
   * Connect to the server, generate new keys, set up message handlers
   * @returns the socket
   */
  setUpSocket = () => {
    this.setState({socketReadyState: 0}) //mark that we are making a new WebSocket connection

    const socket = new WebSocket( //try connecting to the server
      WS_SERVER_URL,
      this.props.location.pathname.replace(/\//ig, "-") //pass the URL pathname as the protocol ('/' characters are replaced with '-')
    )

    socket.onopen = () => { //once we connect to the server
      genKeys().then(({publicKeyJwk, privateKeyJwk}) => { //generate our key-pair
        //save our keys
        this.publicKeyJwk = publicKeyJwk
        this.privateKeyJwk = privateKeyJwk

        this.send(this.formatPublicKeyMessage()) //broadcast our public key

        this.publicKeyQueue.forEach(this.processPublicKey) //process any outstanding public keys
        this.forceUpdate() //force a re-render
      })
      

      this.addChat( //add a meta chat indicating we've connected
        <span>You have joined the chat room <span className="blob">{this.props.location.pathname}</span></span>,
        "self",
        "meta"
      )

      this.setState({socketReadyState: socket.readyState}) //mark the new socket state

      /* Set up pinging */
      clearInterval(this.pingInterval) //clear the previous interval
      this.pingInterval = window.setInterval( //set up an interval to ping the server
        () => this.socket.send(""), //send empty string
        30000
      )
    }

    socket.onmessage = async (message:MessageEvent<any>) => {
      // console.log("MESSAGE", message)
      try {
        await this.processSocketMessage(message) //process this message
      }
      catch(err) {
        console.error(err)
      }
    }

    socket.onclose = () => {
      this.setState({socketReadyState: socket.readyState})
      //TODO try reconnecting?
    }

    return socket
  }

  breakdownSocket = () => {
    this.socket.close() //disconnect
    this.senderData = {} //clear all our old key data
  }

  /**
   * Utils function to JSON stringify and object then send it to the server
   * @param obj any object
   */
  send = (obj: Object) => {
    this.socket.send(JSON.stringify(obj))
  }

  /**
   * @returns the public key in the right format to send to the server
   */
  formatPublicKeyMessage = ():PublicKeySendType => ({public_key: this.publicKeyJwk})

  /**
   * Process a message from a socket
   * @param message socket message
   */
  processSocketMessage = async (message:MessageEvent) => {
    const parsed = JSON.parse(message.data) //try parsing the message as JSON

    //TODO validate schema
    if(parsed.hasOwnProperty("cipher")) { //if this is an encrypted message
      const message = parsed as EncryptedRecvType

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
    else if(parsed.hasOwnProperty("meta")) { //if this is a meta broadcast
      const message = parsed as MetaRecvType

      const connected = message.meta===MetaEnum.connected
      this.addChat( //add the chat to state
        `Client ${message.sender_addr} ${connected?"":"dis"}connected`,
        message.sender_addr, 
        "meta"
      )

      if(connected) { //if this client just connected
        this.send(this.formatPublicKeyMessage()) //broadcast the public key, TODO targeted send
      }
      else {
        delete this.senderData[message.sender_addr] //delete this client's key data
      }
    }
    else if(parsed.hasOwnProperty("plaintext")) { //if this is a plaintext broadcast
      const message = parsed as PlaintextRecvType

      this.addChat(message.plaintext, message.sender_addr, "plaintext") //add the chat to state
    }
    else if(parsed.hasOwnProperty("public_key")) { //if this is a public key broadcast
      const message = parsed as PublicKeyRecvType

      if(this.privateKeyJwk) { //if my private key is ready
        await this.processPublicKey(message) //process this private key
      }
      else { //else I need to wait for my private key to finish generating
        this.publicKeyQueue.push(message) //save this message to be processed later
      }
    }
    else {
      console.warn("Unexpected message", parsed)
    }

    this.setState({ //update the socket state
      socketReadyState: this.socket.readyState,
    })
  }

  /**
   * Given a public key message, save the public key for this sender and derived the symmetric key
   * @param message parsed public key message
   */
  processPublicKey = async (message: PublicKeyRecvType) => {
    const { public_key, sender_addr } = message

    this.senderData[sender_addr] = { //assign the data to this sender
      derivedKey: await deriveKey(public_key, this.privateKeyJwk), //derive the symmetric key
      publicKeyJwk: public_key, //record the public key
    }

    this.addChat( //add the chat to state
      `Received Client ${sender_addr}'s public key`,
      sender_addr, 
      "meta"
    )
  }

  /**
   * Add a new chat to the state with meta data (time stamp, whether to show the sender name)
   * @param content     content to display
   * @param senderAddr  the sender address
   * @param type        the message type
   */
  addChat = (content: React.ReactNode, senderAddr:string, type: ChatTypeType) => {
    const date = new Date() //get the timestamp
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

  /**
   * Convert the socket ready state code to a string
   * @returns a string representation of the socket state
   */
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

  /**
   * Callback function to submit and possibly encrypt the message to the server
   * @param e submit event
   */
  submitMessage = (e:React.FormEvent<HTMLFormElement>) => {
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


      this.addChat(input, "self", this.state.encrypt?"encrypted":"plaintext") //add this chat to our own state

      this.setState({ input: "" }) //clear the input
    }
  }

  /**
   * Callback function to move to a new room
   * @param e submit event
   */
  newRoomSubmit = (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const newRoomURI = encodeURIComponent(this.state.newRoom) //URI encode the inputed string

    this.props.history.push(newRoomURI) //go to the new URL (ie change rooms)
  }

  render() {
    const {
      encrypt
    } = this.state

    const connectionStatus = this.getConnectionStatus()
    
    const senderDataEntries = Object.entries(this.senderData)

    return (
      <div id="App">
        <div id="main">
          <div id="content">
            <div id="header">
              Current Room: <span  className="blob">{this.props.location.pathname}</span> <span className={`blob  ${connectionStatus}`}>{connectionStatus}</span>
            </div>

            <div id="chat-container">
              <div>
                {this.state.chats.map((m,i) =>
                  <Chat key={i} {...m}/>
                )}
              </div>
            </div>

            <div id="chat-form-container">
              <form id="chat-form" onSubmit={this.submitMessage}>
                <input
                  autoFocus
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setState({input: e.target.value})}
                  placeholder="Aa"
                  value={this.state.input}
                />

                <button type="submit" disabled={this.state.socketReadyState !== 1}>Send</button>
              </form>
            </div>
          </div>

          <div id="sidebar">
            <h2>
              End-to-End Encrypted React - Rust Chat App &nbsp;
              <BlankAnchor href="https://github.com/harryli0088/rust-react-chat">
                <FontAwesomeIcon className="interact" icon={faGithub}/>
              </BlankAnchor>
            </h2>
            <p>Version {clientPackage.version}</p>
            <p>I created this chat room prototype to learn how to use Rust and about end-to-end encryption.</p>
            <p id="disclaimer"><b>DISCLAIMER:</b> This is probably not a cyrptographically secure system and has not been validated by security experts. This is just a side project for me to learn about end-to-end encryption.</p>
            <p>(Note: Heroku free tier server takes several seconds to wake up from sleep mode)</p>
            
            <hr/>

            <form id="new-room-form" onSubmit={this.newRoomSubmit}>
              {/* <h3 style={{display: "inline-block"}}><label htmlFor="new-room-input">Change Rooms:</label></h3> &nbsp; */}
              <input
                id="new-room-input"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setState({newRoom: e.target.value})}
                placeholder="Pick a new room name"
                value={this.state.newRoom}
              />&nbsp;

              <button type="submit">Change Rooms<FontAwesomeIcon icon={faDoorOpen}/></button>
            </form>

            <hr/>

            <div style={{display: "flex", alignItems: "center"}}>
              <label htmlFor="toggle-encrypt" style={{cursor: "pointer"}}>Encrypt Messages:</label> &nbsp;
              <input
                id="toggle-encrypt"
                type="checkbox"
                checked={encrypt}
                onChange={() => this.setState({encrypt: !encrypt})} style={{height: "1em"}}
              />
            </div>
            <div className={`blob ${encrypt?"green":"red"}`} style={{textAlign: "center"}}>
              Your messages will {encrypt===false && "not"} be encrypted &nbsp;
              <FontAwesomeIcon icon={encrypt ? faLock : faLockOpen}/>
            </div>

            {
              this.publicKeyJwk && (
                <React.Fragment>
                  <h4>Your Public Key <FontAwesomeIcon icon={faKey}/></h4>
                  <RenderKey jsonWebKey={this.publicKeyJwk}/>
                  <br/>
                </React.Fragment>
              )
            }

            {this.privateKeyJwk && <RenderPrivateKey jsonWebKey={this.privateKeyJwk}/>}

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
          </div>
        </div>

        <div id="description" className="container">
          <h2>Rust Overview <FontAwesomeIcon icon={faRust}/></h2>
          <p>The Rust server features include:</p>
          <ul>
            <li>WebSocket server</li>
            <li>Chat rooms via routes (via WebSocket protocol)</li>
            <li>Alerts when a client connects or disconnects</li>
            <li>Broadcast or targeted messages</li>
          </ul>

          <hr/>

          <h2>End-to-End Encryption Overview <FontAwesomeIcon icon={faLock}/></h2>

          <h3>Intro</h3>
          <p>This is an end-to-end encrypted chat app that uses the <BlankAnchor href="https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto">Subtle Web Crypto API</BlankAnchor> for encryption and sends messages to other clients via a Rust WebSocket server. I followed <BlankAnchor href="https://getstream.io/blog/web-crypto-api-chat/">this Stream tutorial</BlankAnchor> to implement the encryption logic.</p>

          <h3>Ephemeral Key Generation <BlankAnchor href="https://github.com/harryli0088/rust-react-chat/blob/master/client/src/utils/crypto/genKeys.ts"><FontAwesomeIcon className="interact" icon={faCode}/></BlankAnchor></h3>
          <p>A client called Alice generates a public key and private key using the <BlankAnchor href="https://en.wikipedia.org/wiki/Elliptic-curve_Diffie%E2%80%93Hellman">Elliptic Curve Diffie-Hellman (ECDH)</BlankAnchor> algorithm, which enables 2 people to share their public keys and generate a shared secret symmetric key for encryption. Alice creates these ephemeral keys when connecting to this website and deletes her keys once she disconnects.</p>

          <h3>Public Key Broadcasting</h3>
          <p>Once Alice opens this site, connects with the server, and generates a key-pair, she sends her public key to the WebSocket server. The server then broadcasts the public key to the other clients in the room. In turn, the other clients also send their public keys to Alice, so that every client has the public keys of all the other clients.</p>

          <h3>Deriving a Shared Secret Symmetric Key <BlankAnchor href="https://github.com/harryli0088/rust-react-chat/blob/master/client/src/utils/crypto/deriveKey.ts"><FontAwesomeIcon className="interact" icon={faCode}/></BlankAnchor></h3>
          <p>When Alice receives a public key from another client Bob, Alice combines his <i>public</i> key with her own <i>private</i> key to derive a new key. Bob combines Alice's public key with his private key to also derive a new key. Because of the Diffie-Hellman algorithm, Alice and Bob actually end up separately deriving the <i>same symmetric key</i> which they can use to encrypt their messages to each other. As long as Alice and Bob protect their own private keys, it is computationally infeasible for someone else to calculate their secret symmetric key.</p>

          <h3>Encryption <BlankAnchor href="https://github.com/harryli0088/rust-react-chat/blob/master/client/src/utils/crypto/encrypt.ts"><FontAwesomeIcon className="interact" icon={faCode}/></BlankAnchor></h3>
          <p>Encryption is done using the Advanced Encryption Standard - Galois/Counter Mode (<BlankAnchor href="https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf">AES-GCM</BlankAnchor>) algorithm, which uses a randomly generated initialization vector to convert the plaintext message into an encrypted ciphertext. When Alice wants to send an encrypted message, she encrypts the plaintext message for every separate recipient. She sends a ciphertext, the initialization vector, and the recipient address to the server, which routes the targeted message to the intended recipient.</p>

          <h3>Decryption <BlankAnchor href="https://github.com/harryli0088/rust-react-chat/blob/master/client/src/utils/crypto/decrypt.ts"><FontAwesomeIcon className="interact" icon={faCode}/></BlankAnchor></h3>
          <p>When Bob receives an encrypted message from Alice, he uses their derived symmetric key to decrypt the message.</p>

          <h3>Message Integrity</h3>
          <p>How do we know that a malicious attacker/server Eve didn't tamper with the message in-transit, aka a <BlankAnchor href="https://en.wikipedia.org/wiki/Man-in-the-middle_attack">man-in-the-middle attack</BlankAnchor>? Symmetric encryption schemes could use <BlankAnchor href="https://en.wikipedia.org/wiki/Message_authentication_code">message authentication codes</BlankAnchor>. The nice thing about AES-GCM is that it handles message integrity; if Eve tampers with the message, the decryption process will probably fail (<BlankAnchor href="https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf">see this document, page 26</BlankAnchor>).</p>
          
          <h3>Out-of-Band Verification</h3>
          <p>How do we know that the server isn't faking the public keys? It's possible for a malicious server Eve to break the encryption by simply generating her own keys and intercepting mesages. When Alice sends her public key to Bob, Eve stores it, but then sends <i>Eve's</i> public key to Bob, pretending that it's Alice's. Eve also takes Bob's public key, but sends <i>Eve's</i> public key to Alice. In this way, Eve can intercept a message from Alice, decrypt it, then re-encrypt it to send to Bob (and vise versa). Alice and Bob would be none the wiser. It is therefore critical to validate public keys. The only way to do this is via   <BlankAnchor href="https://ssd.eff.org/en/module/key-verification">out-of-band verification</BlankAnchor>. Alice and Bob need to communicate in some way outside this app and verify each other's keys (ie over the phone, QR codes, etc). Signal implements this with <BlankAnchor href="https://support.signal.org/hc/en-us/articles/360007060632-What-is-a-safety-number-and-why-do-I-see-that-it-changed-">safety numbers</BlankAnchor>.</p>
        </div>

        <footer className="container">
          <div>Built using <BlankAnchor href="https://reactjs.org/">React</BlankAnchor>, <BlankAnchor href="https://www.typescriptlang.org/">TypeScript</BlankAnchor>, <BlankAnchor href="https://fontawesome.com/license">Font Awesome</BlankAnchor>, and <BlankAnchor href="https://www.rust-lang.org/">Rust</BlankAnchor></div>
          <br/>
          <div><BlankAnchor href="https://github.com/harryli0088/rust-react-chat">Github Repo</BlankAnchor></div>
        </footer>
      </div>
    );
  }
}

export default withRouter(App)
