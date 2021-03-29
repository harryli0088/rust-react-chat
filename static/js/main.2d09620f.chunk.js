(this.webpackJsonpclient=this.webpackJsonpclient||[]).push([[0],{19:function(e){e.exports=JSON.parse('{"name":"client","version":"1.0.2","private":true,"dependencies":{"@testing-library/jest-dom":"^5.11.6","@testing-library/react":"^11.2.2","@testing-library/user-event":"^12.6.0","@types/jest":"^26.0.19","@types/node":"^12.19.9","@types/react":"^16.14.2","@types/react-dom":"^16.9.10","gh-pages":"^3.1.0","node-sass":"^4.14.1","react":"^17.0.1","react-dom":"^17.0.1","react-router-dom":"^5.2.0","react-scripts":"4.0.1","typescript":"^4.1.3","web-vitals":"^0.2.4"},"scripts":{"start":"react-scripts start","build":"react-scripts build","test":"react-scripts test","eject":"react-scripts eject","predeploy":"npm run build","deploy":"gh-pages -d build"},"eslintConfig":{"extends":["react-app","react-app/jest"]},"browserslist":{"production":[">0.2%","not dead","not op_mini all"],"development":["last 1 chrome version","last 1 firefox version","last 1 safari version"]},"homepage":"https://harryli0088.github.io/rust-react-chat","devDependencies":{"@types/react-router-dom":"^5.1.7"}}')},28:function(e,t,n){},29:function(e,t,n){},30:function(e,t,n){},36:function(e,t,n){"use strict";n.r(t);var r=n(0),s=n(1),a=n.n(s),c=n(18),o=n.n(c),i=(n(28),n(22)),d=n(9),l=n(10),p=n(12),h=n(11),u=(n(29),function(e){Object(p.a)(n,e);var t=Object(h.a)(n);function n(){var e;Object(d.a)(this,n);for(var s=arguments.length,a=new Array(s),c=0;c<s;c++)a[c]=arguments[c];return(e=t.call.apply(t,[this].concat(a))).showSenderAddr=function(){if(e.props.showSenderAddr){var t="self"===e.props.senderAddr?"You":e.props.senderAddr;return Object(r.jsx)("div",{className:"sender",children:t})}},e}return Object(l.a)(n,[{key:"render",value:function(){return this.props.content?Object(r.jsx)("div",{className:"message-container",children:Object(r.jsx)("div",{className:"message ".concat(this.props.senderAddr," ").concat(this.props.type),children:Object(r.jsxs)("div",{children:[this.showSenderAddr(),Object(r.jsx)("span",{className:"content",children:"string"===typeof this.props.content?Object(r.jsx)("pre",{children:this.props.content}):this.props.content})]})})}):null}}]),n}(a.a.Component)),j=n.p+"static/media/github.7ef381bc.svg",b=n(2),m=n(19),f=(n(30),function(e){Object(p.a)(n,e);var t=Object(h.a)(n);function n(e){var s;return Object(d.a)(this,n),(s=t.call(this,e)).lastDate=new Date,s.lastSenderAddr="",s.lastType="",s.pingInterval=-1,s.socket=void 0,s.setUpSocket=function(){var e=new WebSocket("wss://guarded-wave-42520.herokuapp.com",s.props.location.pathname.replace(/\//gi,"-"));return e.onopen=function(){s.addChat(Object(r.jsxs)("span",{children:["You have joined the chat room ",Object(r.jsx)("span",{className:"blob",children:s.props.location.pathname})]}),"self","meta"),s.setState({socketReadyState:e.readyState}),clearInterval(s.pingInterval),s.pingInterval=window.setInterval(s.ping,3e4)},e.onmessage=function(e){console.log("MESSAGE",e);try{var t=JSON.parse(e.data);s.addChatFromSocket(t.message,t.sender_addr,t.type_key)}catch(n){console.error(n)}},e.onclose=function(){s.setState({socketReadyState:e.readyState})},e},s.ping=function(){return s.socket.send("")},s.addChatFromSocket=function(e,t,n){s.addChat(e,t,n),s.setState({socketReadyState:s.socket.readyState})},s.addChat=function(e,t,n){var r=new Date,a={content:e,date:r,senderAddr:t,showSenderAddr:s.lastSenderAddr!==t||s.lastType!==n,type:n};s.lastDate=r,s.lastSenderAddr=a.senderAddr,s.lastType=a.type,s.setState({chats:s.state.chats.concat(a)})},s.getConnectionStatus=function(){switch(s.state.socketReadyState){case 0:return"Connecting";case 1:return"Connected";case 2:return"Closing";default:return"Closed"}},s.onChatTypeSubmit=function(e){e.preventDefault();var t=s.state.input.trim();t&&(s.socket.send(t),s.addChat(t,"self","user"),s.setState({input:""}))},s.onNewRoomSubmit=function(e){e.preventDefault();var t=encodeURIComponent(s.state.newRoom);s.props.history.push(t)},s.state={input:"",chats:[],newRoom:"",socketReadyState:-1},s.socket=s.setUpSocket(),s}return Object(l.a)(n,[{key:"componentDidUpdate",value:function(e){e.location.pathname!==this.props.location.pathname&&(this.socket.close(),this.socket=this.setUpSocket())}},{key:"componentWillUnmount",value:function(){this.socket.close()}},{key:"render",value:function(){var e=this,t=this.getConnectionStatus();return Object(r.jsxs)("div",{id:"App",children:[Object(r.jsxs)("div",{id:"content",children:[Object(r.jsxs)("div",{id:"header",className:"container",children:["Current Room: ",Object(r.jsx)("span",{className:"blob",children:this.props.location.pathname})," ",Object(r.jsx)("span",{className:"blob  ".concat(t),children:t})]}),Object(r.jsx)("div",{id:"chat-container",className:"container",children:this.state.chats.map((function(e,t){return Object(r.jsx)(u,Object(i.a)({},e),t)}))}),Object(r.jsx)("div",{id:"chat-form-container",children:Object(r.jsxs)("form",{id:"chat-form",onSubmit:this.onChatTypeSubmit,children:[Object(r.jsx)("input",{autoFocus:!0,onChange:function(t){return e.setState({input:t.target.value})},value:this.state.input}),Object(r.jsx)("button",{type:"submit",disabled:1!==this.state.socketReadyState,children:"Send"})]})})]}),Object(r.jsxs)("div",{id:"sidebar",children:[Object(r.jsx)("a",{id:"github",href:"https://github.com/harryli0088/rust-react-chat",target:"_blank",rel:"noopener noreferrer",children:Object(r.jsx)("img",{src:j,alt:"github repo"})}),Object(r.jsx)("h2",{children:"React - Rust Chat App"}),Object(r.jsxs)("p",{children:["Version ",m.version]}),Object(r.jsx)("p",{children:"I created this chat room prototype to learn how to use Rust. The Rust server features include:"}),Object(r.jsxs)("ul",{children:[Object(r.jsx)("li",{children:"WebSocket server"}),Object(r.jsx)("li",{children:"Chat rooms distinguished by route (via WebSocket protocol)"}),Object(r.jsx)("li",{children:"Alerts when a client connects or disconnects"})]}),Object(r.jsx)("hr",{}),Object(r.jsxs)("form",{id:"new-room-form",onSubmit:this.onNewRoomSubmit,children:[Object(r.jsx)("br",{}),Object(r.jsx)("label",{htmlFor:"new-room-input",children:"Change Rooms:"}),Object(r.jsxs)("div",{children:[Object(r.jsx)("input",{id:"new-room-input",onChange:function(t){return e.setState({newRoom:t.target.value})},placeholder:"Enter a new room code",value:this.state.newRoom}),"\xa0",Object(r.jsx)("button",{type:"submit",children:"Change"})]}),Object(r.jsx)("br",{})]}),Object(r.jsx)("hr",{}),Object(r.jsxs)("div",{children:[Object(r.jsxs)("p",{children:["Built using ",Object(r.jsx)("a",{href:"https://reactjs.org/",target:"_blank",rel:"noopener noreferrer",children:"React"}),", ",Object(r.jsx)("a",{href:"https://www.typescriptlang.org/",target:"_blank",rel:"noopener noreferrer",children:"Typescript"}),", ",Object(r.jsx)("a",{href:"https://fontawesome.com/license",target:"_blank",rel:"noopener noreferrer",children:"Font Awesome"}),", and ",Object(r.jsx)("a",{href:"https://www.rust-lang.org/",target:"_blank",rel:"noopener noreferrer",children:"Rust"})]}),Object(r.jsx)("p",{children:Object(r.jsx)("a",{href:"https://github.com/harryli0088/rust-react-chat",target:"_blank",rel:"noopener noreferrer",children:"Github Repo"})})]})]})]})}}]),n}(a.a.Component)),O=Object(b.d)(f),g=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,37)).then((function(t){var n=t.getCLS,r=t.getFID,s=t.getFCP,a=t.getLCP,c=t.getTTFB;n(e),r(e),s(e),a(e),c(e)}))},v=n(21);o.a.render(Object(r.jsx)(a.a.StrictMode,{children:Object(r.jsx)(v.a,{children:Object(r.jsx)(O,{})})}),document.getElementById("root")),g()}},[[36,1,2]]]);
//# sourceMappingURL=main.2d09620f.chunk.js.map