# React Rust Chat App

This is a chat application I built using React, TypeScript, and Rust. I deployed the client to Github pages https://harryli0088.github.io/rust-react-chat/ and the server to Heroku. Note I'm using the Heroku free tier which takes several seconds to wake up from sleep mode.

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
