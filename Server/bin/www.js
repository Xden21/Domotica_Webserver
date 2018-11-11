#!/usr/bin/env node

/**
 * Module dependencies.
 */

var { app, modbusConnection, getCoilList } = require('../app')
var debug = require('debug')('domitica-webserver:server')
var http = require('http')
var socketio = require('socket.io')

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000')
app.set('port', port)

/**
 * Create HTTP server.
 */

var server = http.createServer(app)

/**
 * Add Socket.io socket.
 */
var io = socketio(server)

let connectionCount = 0
let refreshTimer

async function sendGroupData (group) {
  if (group.groups) {
    for (const subGroup of group.groups) {
      await sendGroupData(subGroup)
    }
  }
  for (const input of group.inputs) {
    let coilValue
    try {
      coilValue = await modbusConnection.readInput(input.id)
      coilValue = coilValue.data[0]
    } catch (err) {
      console.log('Error on reading input.')
      coilValue = false
    }

    io.emit('inputReceive', { coil: input.id, value: coilValue })
  }
  for (const slider of group.sliders) {
    let coilValue
    try {
      coilValue = await modbusConnection.readCoil(slider.id)
      coilValue = coilValue.data[0]
    } catch (err) {
      console.log('Error on reading coil.')
      coilValue = false
    }

    io.emit('toggleReceive', { coil: slider.id, value: coilValue })
  }
}

async function stateRefresh () {
  if (connectionCount === 0 && refreshTimer) {
    console.log('Stopping refresh timer.')
    clearInterval(refreshTimer)
    return
  }
  let coilList = getCoilList()
  io.emit('test')
  for (const group of coilList) {
    await sendGroupData(group)
  }
}

function startStateRefresh () {
  if (connectionCount === 1) {
    console.log('Starting refresh timer.')
    refreshTimer = setInterval(stateRefresh, 500)
  }
}

io.on('connection', (socket) => {
  connectionCount++
  if (connectionCount === 1) {
    console.log('Connecting to modbus server.')
    modbusConnection.connect().then(() => {
      console.log('Modbus client connected.')
    }).catch((err) => {
      console.log('Modbus client could not be connected', err)
    })
  }
  console.log('Amount of sockets connected: ' + connectionCount)
  console.log('Io Socket connected')
  socket.on('disconnect', () => {
    console.log('socket disconnected')
    connectionCount--
    console.log('Amount of sockets connected:' + connectionCount)
    if (connectionCount === 0) {
      console.log('Disconnecting from modbus server')
      modbusConnection.disconnect()
    }
  })

  socket.on('buttonClick', (coil) => {
    console.log('Pulsing coil: ', coil)
    modbusConnection.writePulse(coil).catch((err) => console.log('Write coil ' + coil + 'Error', err))
  })

  socket.on('buttonToggle', (data) => {
    modbusConnection.writeCoil(data.coil, data.value).catch((err) => console.log('Write coil ' + data.coil + 'Error', err))
  })

  socket.on('start-refresh', () => {
    startStateRefresh()
  })
})

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port)
server.on('error', onError)
server.on('listening', onListening)

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort (val) {
  var port = parseInt(val, 10)

  if (isNaN(port)) {
    // named pipe
    return val
  }

  if (port >= 0) {
    // port number
    return port
  }

  return false
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError (error) {
  if (error.syscall !== 'listen') {
    throw error
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
    default:
      throw error
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening () {
  var addr = server.address()
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port
  debug('Listening on ' + bind)
}
