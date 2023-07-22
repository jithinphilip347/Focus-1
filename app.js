var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
// var logger = require('morgan');
const mongoose = require('mongoose')
const session = require('express-session');
var Handlebars = require('handlebars');
var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var hbs=require('express-handlebars');
var moment = require('moment');
// const handlebarsHelpers = require('./handlebars-helpers');

// const { Session } = require('inspector');
var app = express();

mongoose.connect('mongodb://127.0.0.1:27017/focus')
.then(()=>console.log("database connected successfully....."))
.catch((err)=>console.log(err))



Handlebars.registerHelper("inc", function(value, options)
{
    return parseInt(value) + 1;
});

Handlebars.registerHelper('ifEquals', function (a, b, options) {
  if (a === b) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('isSelected', function (a, b, options) {
  return a === b ? options.fn(this) : '';
});

// Handlebars.registerHelper('add', function (num1, num2) {
//   return num1 + num2;
// });


// Handlebars.registerHelper('subtract', function (num1, num2) {
//   return num1 - num2;
// });


Handlebars.registerHelper('gt', function (a, b, options) {
  if (a > b) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('customHelper', function (value, options) {
  return Handlebars.helpers.gt(value, 1, options);
});

Handlebars.registerHelper('if_eq', function (a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('if_gt', function (a, b, options) {
  return a > b ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('sub', function (a, b) {
  return a - b;
});

Handlebars.registerHelper('if_lt', function (a, b, options) {
  return a < b ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('formatDate', function (date, format) {
  return moment(date).format(format);
});

// view engine setup   
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout',partialsDir:__dirname+'/views/layout/partials',

}))
app.set('view engine', 'hbs');



app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

 
// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
