var config = {
  username: 'domotica.debree@hotmail.com',
  password: 'SxJMEQd5j57OGL25',
  alarmFields: ['status', 'date', 'name', 'label']
}

const Verisure = require('../bin/Security/verisure-api.js').setup(config)

Verisure.get('alarmStatus')
  .then((data) => {
    console.log(data)
  })
  .catch((err) => {
    console.log(err)
  })

/*
Verisure.get('climateData')
  .then((data) => {
    console.log(data)
  })
  .catch((err) => {
    console.log(err)
  })
  */
