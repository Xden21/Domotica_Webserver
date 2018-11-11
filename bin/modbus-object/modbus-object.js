let { ModbusDatabase, options } = require('../database/database')

let database = new ModbusDatabase(options)

async function getGroups (superGroup) {
  console.log('Searching for subgroups of: ', superGroup)
  if (await database.hasSubGroups(superGroup)) {
    console.log(superGroup + ' Has subgroups')
    let groups = await database.getAllSubGroups(superGroup)
    for (const group of groups) {
      let subGroups = await getGroups(group.name)
      if (subGroups) {
        group.groups = subGroups
      }
      console.log('Searching for coils of: ', group.name)
      group.inputs = []
      group.buttons = []
      group.sliders = []
      let coils = await database.getCoils(group.name)
      coils.forEach(coil => {
        if (coil.Type === 'input') {
          group.inputs.push({
            id: coil.idCoils,
            name: coil.Name
          })
        } else if (coil.Type === 'button') {
          group.buttons.push({
            id: coil.idCoils,
            name: coil.Name
          })
        } else if (coil.Type === 'slider') {
          group.sliders.push({
            id: coil.idCoils,
            name: coil.Name
          })
        } else {
          throw new Error('Unknown coil type given: ' + coil.Type)
        }
      })
      if ((group.inputs.length > 0) || (group.buttons.length > 0) || (group.sliders.length > 0)) {
        group.hasView = true
      } else {
        group.hasView = false
      }
    }
    return groups
  } else {
    console.log(superGroup + ' Has no subgroups')
    return undefined
  }
}

async function refresh () {
  let groups = []
  let res = await database.getTopGroups()
  for (let i = 0; i < res.length; i++) {
    groups[i] = { name: res[i].GroupName }
  }
  console.log('Found top groups: ', groups)

  for (const group of groups) {
    let subGroups = await getGroups(group.name)
    if (subGroups) {
      group.groups = subGroups
    }
    console.log('Searching for coils of: ', group.name)
    group.inputs = []
    group.buttons = []
    group.sliders = []
    let coils = await database.getCoils(group.name)
    if (coils) {
      coils.forEach(coil => {
        if (coil.Type === 'input') {
          group.inputs.push({
            id: coil.idCoils,
            name: coil.Name
          })
        } else if (coil.Type === 'button') {
          group.buttons.push({
            id: coil.idCoils,
            name: coil.Name
          })
        } else if (coil.Type === 'slider') {
          group.sliders.push({
            id: coil.idCoils,
            name: coil.Name
          })
        } else {
          throw new Error('Unknown coil type given: ' + coil.Type)
        }
      })
    }
    if ((group.inputs.length > 0) || (group.buttons.length > 0) || (group.sliders.length > 0)) {
      group.hasView = true
    } else {
      group.hasView = false
    }
  }
  console.log(JSON.stringify(groups, undefined, 2))
  return groups
}

module.exports = {
  refresh,
  database
}
