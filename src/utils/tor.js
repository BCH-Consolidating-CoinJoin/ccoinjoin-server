/*
  Utility library for working with tor in a production environment.
*/

'use strict'

const wlogger = require(`./logging`)
const fs = require('fs')
const shelljs = require('shelljs')

const util = require('util')
util.inspect.defaultOptions = { depth: 1 }

module.exports = {
  getHostname // Retrieve the tor hostname.
}

// Attempts to read the tor hostname file. If it can't, it will try run a bash
// script file that will change the permissions to allow the file to be read.
async function getHostname () {
  try {
    wlogger.silly('Entering tor.js/getHostname()')
    return await readHostnameFile()
  } catch (err) {
    // wlogger.error(`Error in getHostname(): ${util.inspect(err)}`)
    console.log(`Could not open tor hostname file.`)

    // Try to set the hostname permissions
    try {
      console.log(`Attempting to set permissions to read file.`)
      shelljs.exec(`${__dirname}/../../make-keys-dir-readable`)
    } catch (err) {
      console.log(`Error setting permissions: `, err)
    }

    return false
  }
}

// Returns a promise that resolves to the content of the tor hostname file.
async function readHostnameFile () {
  return new Promise((resolve, reject) => {
    try {
      fs.readFile(`${__dirname}/../../keys/ccoinjoin/hostname`, function (err, data) {
        if (err) {
          return reject(new Error(`Error trying to read hostname file.`))
        }

        return resolve(data)
      })
    } catch (err) {
      // console.log(`Error trying to read hostname file: `, err)
      return reject(new Error(`Error trying to read hostname file.`))
    }
  })
}
