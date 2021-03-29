# React Rust Chat App


## Server
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
