let { ModbusClient } = require('../bin/modbus/modbus')

let client = new ModbusClient('192.168.0.25', '502')

client.connect().then(() => {
  client.writePulse(32796)
}).catch((err) => {
  console.log('Error connecting to modbus server', err)
})
