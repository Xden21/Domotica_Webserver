let { options, ModbusDatabase } = require('../bin/database/database')
let modbusObj = require('../bin/modbus-object/modbus-object')

let db = new ModbusDatabase(options)

/*
db.getTopGroups().then((results) => {
  console.log(results[0].GroupName)
}).catch((err) => {
  console.log(err)
})

db.getCoils('SubTest').then((result) => {
  console.log(result)
}).catch((err) => {
  console.log(err)
})
*/
modbusObj.refresh().then((res) => {
  console.log('Printing modbus object:')
  console.log(JSON.stringify(res, undefined, 2))
}).catch((err) => console.log(err))

// db.hasSubGroups('OtherTest').then((result) => { console.log(result) }).catch((err) => { console.log(err) })
// db.getAllSubGroups('OtherTest').then((result) => { console.log(result) }).catch((err) => { console.log(err) })
