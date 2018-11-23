/*
  Utility library that updates an OrbitDB with the server info and tor .onion
  address.
*/

'use strict'

const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')

const util = require('util')
util.inspect.defaultOptions = { depth: 3 }

module.exports = {
  broadcastHostname // Broadcast tor .onion hostname to IPFS network.
}

let ipfsIsReady = false
let ipfsInterval

// OrbitDB uses Pubsub which is an experimental feature
// and need to be turned on manually.
// Note that these options need to be passed to IPFS in
// all examples in this document even if not specified so.
const ipfsOptions = {
  start: true,
  EXPERIMENTAL: {
    pubsub: true
  },
  config: {
    Bootstrap: [
      '/ip4/104.236.176.52/tcp/4001/ipfs/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z',
      '/ip4/104.131.131.82/tcp/4001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
      '/ip4/104.236.179.241/tcp/4001/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
      '/ip4/162.243.248.213/tcp/4001/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
      '/ip4/128.199.219.111/tcp/4001/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
      '/ip4/104.236.76.40/tcp/4001/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
      '/ip4/178.62.158.247/tcp/4001/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
      '/ip4/178.62.61.185/tcp/4001/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
      '/ip4/104.236.151.122/tcp/4001/ipfs/QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx',
      '/ip6/2604:a880:1:20::1f9:9001/tcp/4001/ipfs/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z',
      '/ip6/2604:a880:1:20::203:d001/tcp/4001/ipfs/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
      '/ip6/2604:a880:0:1010::23:d001/tcp/4001/ipfs/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
      '/ip6/2400:6180:0:d0::151:6001/tcp/4001/ipfs/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
      '/ip6/2604:a880:800:10::4a:5001/tcp/4001/ipfs/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
      '/ip6/2a03:b0c0:0:1010::23:1001/tcp/4001/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
      '/ip6/2a03:b0c0:1:d0::e7:1/tcp/4001/ipfs/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
      '/ip6/2604:a880:1:20::1d9:6001/tcp/4001/ipfs/QmSoLju6m7xTh3DuokvT3886QRYqxAzb1kShaanJgW36yx',
      '/dns4/node0.preload.ipfs.io/tcp/443/wss/ipfs/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic',
      '/dns4/node1.preload.ipfs.io/tcp/443/wss/ipfs/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6',
      // Add my own bootstrap server
      '/ip4/162.243.158.213/tcp/4002/ipfs/QmQLcCWKuxsMkRt5DJkcSw361iNLikjEBMEj6ovR6pwAb5'
    ]
  }
}

// Create an IPFS instance.
const ipfs = new IPFS(ipfsOptions)
let orbitdb
let gHostname = ''
let db

// console.log(`ipfs.bootstrap: ${util.inspect(ipfs.bootstrap)}`)

ipfs.on('error', err => console.error(err))

// ipfs.bootstrap.add('/ip4/162.243.158.213/tcp/4002/ipfs/QmQLcCWKuxsMkRt5DJkcSw361iNLikjEBMEj6ovR6pwAb5')

// Once IPFS is ready, initialize the DB.
ipfs.on('ready', async () => {
  try {
    console.log(`IPFS is ready.`)
    ipfsIsReady = true

    const list = await ipfs.bootstrap.list()
    console.log(`list: ${util.inspect(list)}`)

    const access = {
      // Give write access to everyone
      write: ['*']
    }

    // Create OrbitDB instance
    orbitdb = new OrbitDB(ipfs)

    db = await orbitdb.eventlog('ccoinjoin', access)
    await db.load() // Load any saved state from disk.

    // Debugging: Display a notification whenever the DB is updated by another
    // node.
    db.events.on('replicated', () => {
      console.log(`replication event fired`)
    })
  } catch (err) {
    console.error(`Error trying to initialize OrbitDB: `, err)
    process.exit(1)
  }
})

// Broadcasts the .onion hostname to the IPFS network.
async function broadcastHostname (hostname) {
  try {
    gHostname = hostname

    if (!ipfsIsReady) {
      ipfsInterval = setInterval(function () {
        checkIfIPFSIsReady()
      }, 60 * 1000)
    } else {
      console.log(`broadcasting hostname to IPFS...`)
      console.log(`IPFS address: ${db.address}`)

      const now = new Date()

      // setInterval(async function () {
      //  const name = Math.floor(Math.random() * 1000).toString()
      //  console.log(`Adding ${name} to DB.`)
      //  await db.add({ server: name, timestamp: now.toISOString() })
      // }, 1000 * 20)

      await db.add({ server: hostname, timestamp: now.toISOString() })
    }
  } catch (err) {
    console.log(`Error in broadcastHostname: `, err)
  }
}

function checkIfIPFSIsReady () {
  if (ipfsIsReady) {
    clearInterval(ipfsInterval)
    broadcastHostname(gHostname)
  }
}
