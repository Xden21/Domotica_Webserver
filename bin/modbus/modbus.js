'use strict'

const Modbus = require('modbus-serial')

class ModbusClient {
  constructor (host, port) {
    let _host = host
    let _port = port
    this.getHost = function () { return _host }
    this.getPort = function () { return _port }
    this.client = new Modbus()
  }

  connect () {
    let connect = this.client.connectTCP(this.getHost(), { port: this.getPort() })
    this.client.setID(1)
    return connect
  }

  disconnect () {
    return this.client.close()
  }

  readCoil (coilNumber) {
    return this.client.readCoils(coilNumber, 1)
  }

  writeCoil (coilNumber, value) {
    return this.client.writeCoil(coilNumber, value)
  }

  async writePulse (coilNumber) {
    try {
      await this.writeCoil(coilNumber, true)
      await setTimeout(this.writeCoil(coilNumber, false), 100)
    } catch (err) {
      console.log('Error on writing pulse')
    }
  }

  readInput (inputNumber) {
    return this.client.readDiscreteInputs(inputNumber, 1)
  }
}

module.exports = {
  ModbusClient
}
