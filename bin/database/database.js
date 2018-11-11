const mysql = require('promise-mysql')

const options = {
  host: 'localhost',
  user: 'dennis',
  password: 'dbdebree',
  database: 'domotica',
  connectionLimit: '10',
  insecureAuth: true
}

class ModbusDatabase {
  constructor (options) {
    let db = mysql.createPool(options)
    this.getDB = () => { return db }
  }

  getTopGroups () {
    return this.getDB().query('select GroupName from `groups` where SuperGroup is null order by GroupName')
  }

  async hasSubGroups (groupName) {
    let result
    try {
      result = await this.getDB().query('select x.GroupName from `groups` as x, `groups` as y where x.GroupName = y.SuperGroup and x.GroupName = ?', [groupName])
    } catch (err) {
      console.log(err)
    }
    return (result.length >= 1)
  }

  async getAllSubGroups (groupName) {
    let resultArray
    let result = []
    try {
      resultArray = await this.getDB().query('select y.GroupName from `groups` as x, `groups` as y where x.GroupName = y.SuperGroup and x.GroupName = ? order by y.GroupName', [groupName])
    } catch (err) {
      console.log(err)
    }
    if (resultArray.length === 0) {
      return undefined
    }
    for (let i = 0; i < resultArray.length; i++) {
      result.push({ name: resultArray[i].GroupName })
    }
    return result
  }

  async getCoils (groupName) {
    if (!groupName) {
      return this.getDB().query('select * from `coils` order by Name')
    } else {
      return this.getDB().query('select * from `coils` as x where x.Group = ?', [groupName])
    }
  }
}

module.exports = {
  ModbusDatabase,
  options
}
