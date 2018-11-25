# Consolidating CoinJoin
This is an API server forked from this [koa boilerplate](https://github.com/christroutner/babel-free-koa2-api-boilerplate). It implements the [Consolidating CoinJoin protocol](https://gist.github.com/christroutner/457b99b8033fdea5ae565687e6360323). It works with this [BCH command-line wallet](https://github.com/BCH-Consolidating-CoinJoin/ccoinjoin-wallet).

*Disclaimer*: It is the opinion of some educated people that a server running this software on BCH mainnet may be subject to USA money transmission laws. Other educated people disagree with that opinion ([source](https://twitter.com/christroutner/status/1064334027203653633)). No effort has been expended to research the legality of the this software, that is the responsibility of the end user. This software is intended to only run on testnet, as a proof-of-concept of how software can be used to protect individual sovereignty and defend against government overreach.

Efforts are currently under way to allow users to run this server as a tor hidden service (with a .onion address). If you'd like to know more, feel free to ask for a status update on [the BITBOX Discord channel](https://discord.gg/m5h28ND)


Future improvements to be made:
- Configure production server as a hidden service on the Tor network.
- Implement OrbitDB to announce the servers .onion address over the IPFS network.
- Add bootstrap bot, to bootstrap initial volume and ensure users money are returned within 24 hours.
- Operator fees need to be considered and implemented.
- Auditing of balances needs to be done more thoroughly.
- Ensure DB entries and wallet information is deleted after each round.
  - Implement scrubbing and other extreme deletion measures.
- Add a front end web browser interface with QR codes for easy scanning by smart phone apps.


[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com) [![Greenkeeper badge](https://badges.greenkeeper.io/BCH-Consolidating-CoinJoin/consolidating-coinjoin.svg)](https://greenkeeper.io/)


## Requirements
* node __^8.9.4__
* npm __^5.7.1__

## Installation
Installation is different depending on if you want to create a *development* server for developing the code, or a *production* server for setting up your own Consolidating CoinJoin service.

### Development
- `npm install` to install npm dependencies.
- `./install-mongo` to install and setup mongodb.
- `npm test` to run tests and ensure everything is working correctly.
- `npm start` to run a development server.

### Production
This server requires a Mongo database, so it uses Docker Compose to run in production.
[This tutorial](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-16-04)
shows how to setup Docker.
[This tutorial](https://www.digitalocean.com/community/tutorials/how-to-install-docker-compose-on-ubuntu-16-04)
shows how to setup Docker Compose. Here are some commands to build and run this
application with Docker Compose:

- `docker-compose build --no-cache` will build the Docker container from scratch.
  If previously used, this will fail without first deleting the `database` folder,
  which is created with root privileges by Docker, so it must be deleted with the
  command `sudo rm -rf database`.

- `docker-compose up -d` will run the server in the background (daemon mode).
  The server attaches to port 5000 on the host by default.

It is assumed that a production server will have nginx sitting in front of the docker containers. Nginx will serve static content, handle SSL, and proxy API calls to the docker container on port 5000.


## Structure
```
├── bin
│   └── server.js            # Bootstrapping and entry point
├── config                   # Server configuration settings
│   ├── env                  # Environment specific config
│   │   ├── common.js
│   │   ├── development.js
│   │   ├── production.js
│   │   └── test.js
│   ├── index.js             # Config entrypoint - exports config according to envionrment and commons
│   └── passport.js          # Passportjs config of strategies
├── src                      # Source code
│   ├── modules
│   │   ├── controller.js    # Module-specific controllers
│   │   └── router.js        # Router definitions for module
│   ├── models               # Mongoose models
│   └── middleware           # Custom middleware
│       └── validators       # Validation middleware
└── test                     # Unit tests
```

## Usage
* `npm start` Start server on live mode
* `npm run dev` Start server on dev mode with nodemon
* `npm run docs` Generate API documentation
* `npm test` Run mocha tests

## License
MIT
