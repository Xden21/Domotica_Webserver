var express = require('express')
var router = express.Router()

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    domoticaIp: req.modbusConnection.getHost(),
    domoticaPort: req.modbusConnection.getPort(),
    groups: req.groups
  })
})

module.exports = router
