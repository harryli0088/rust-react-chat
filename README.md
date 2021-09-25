# End-to-End Encrypted React - Rust Chat App

Live Site (Note: Heroku free tier server takes several seconds to wake up from sleep mode): https://harryli0088.github.io/rust-react-chat/

![Screenshot](/client/public/screenshot.png)

This is an end-to-end encrypted chat application I built using React, TypeScript, and Rust. I deployed the client to Github pages and the server to Heroku.

## Encryption

I use the Web Crypto API and the Diffie-Hellman key exchange algorithm to encrypt messages between clients. Check out the site for more details!

## Development
```
npm i
npm start
```

## Client Deploy
https://create-react-app.dev/docs/deployment/#github-pages

## Server Deploy
Deployed to Heroku using this buildpack: https://github.com/emk/heroku-buildpack-rust

### Deploy a subdirectory to heroku
```
git subtree push --prefix server heroku main
```

### Heroku commands
```
heroku git:remote -a <app-name> #set remote app
heroku run bash -a <app-name> #ssh into remote app
heroku config:set YOUR_ENV_VARIABLE=value #set environment variable
```

## Misc
- Heroku probably deploys to AWS by default, using Elastic Beanstalk as a load balancer. Pinging is therefore necessary to keep the WebSocket connections alive, otherwise AWS EB times out after two minutes or so.

## License
MIT License
