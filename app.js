var createError = require('http-errors')
var express = require('express')
var exphbs = require('express-handlebars')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var { ModbusClient } = require('./bin/modbus/modbus')
var coilListReader = require('./bin/modbus-object/modbus-object')
let scheduler = require('node-schedule')
let hbsHelpers = require('./bin/handlebars-helpers/hbs-helper')

var indexRouter = require('./routes/index')

var app = express()

// Hbs setup
var hbs = exphbs.create({ defaultLayout: 'main',
  extname: '.hbs',
  helpers: {
    and: hbsHelpers.and
  }
})

/**
 * Setup modbus connection.
 */
var modbusConnection = new ModbusClient('192.168.0.25', '502')

/**
 * Setup coil list from database.
 */
let coilList = []
console.log('Reading coil list')
coilListReader.refresh().then((res) => {
  console.log('Coil list read succesfully at ', new Date(Date.now()).toLocaleString())
  coilList = res
  startCoilListJob()
}).catch((err) => {
  console.log(err)
})

function startCoilListJob () {
  scheduler.scheduleJob('0 * * * *', () => { // Runs every hour at the time of the startup.
    coilListReader.refresh((res) => {
      console.log('Coil list read succesfully at ', Date.now().toLocaleString())
      coilList = res
    })
  })
}

function getCoilList () {
  return coilList
}

// view engine setup
app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'views')))

app.use(function (req, res, next) {
  req.modbusConnection = modbusConnection
  req.groups = getCoilList()
  next()
})

app.use('/', indexRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  console.log(err)
  res.render('error')
})

module.exports = {
  app,
  modbusConnection,
  getCoilList,
  coilListReader
}
