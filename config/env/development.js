/*
export default {
  session: 'secret-boilerplate-token',
  token: 'secret-jwt-token',
  database: 'mongodb://localhost:27017/p2pvps-server-dev'
}
*/

module.exports = {
  session: 'secret-boilerplate-token',
  token: 'secret-jwt-token',
  database: 'mongodb://localhost:27017/coinjoin-dev',
  port: 47891,
  ccoinJoinData: {
    torEnabled: false,
    torPort: 47891,
    torAddress: '',
    clearAddress: ''
  }
}
