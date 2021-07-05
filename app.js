var express = require("express");
var path = require('path'); //Extract the filename from a file path:
const mongoose = require('mongoose');
var config = require('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
const { body, validationResult } = require('express-validator');
var fileUpload = require('express-fileupload');
var passport=require('passport');

//connect to database
mongoose.connect(config.database, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("We are connected to database");
});

//initialise app
var app=express();

//view engine setup to use ejs template
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

//set public folder
app.use(express.static(path.join(__dirname,'public')));

//global variable
app.locals.errors=null;

//get page models
var Page=require('./models/page');

//get all pages to pass to header.ejs
Page.find({}).sort({sorting: 1}).exec(function (err,pages){
  if(err){
    console.log(err);
  }else{
    app.locals.pages=pages;
  }
});

var Category=require('./models/category');

//get all categoriess
Category.find(function (err,categories){
  if(err){
    console.log(err);
  }else{
    app.locals.categories=categories;
  }
});

//express fileUpload
app.use(fileUpload());

//body Parser
app.use(bodyParser.urlencoded({ extended: false }));// parse application/x-www-form-urlencoded
app.use(bodyParser.json());// parse application/json

//express sessions
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
  // cookie: { secure: true }
}));

//expree validator
app.post(
  '/user',
  body('username').isEmail(),
  body('password').isLength({ min: 5 }),

  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    User.create({
      username: req.body.username,
      password: req.body.password,
    }).then(user => res.json(user));
  },
);

//express messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//passport
require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());

app.get('*',function(req,res,next){
  res.locals.cart = req.session.cart;
  res.locals.user=req.user || null;
  next();
});

//set route
var pages=require('./routes/pages.js');
var products=require('./routes/products.js');
var cart=require('./routes/cart.js');
var users=require('./routes/users.js');
var adminPages=require('./routes/adminPages.js');
var adminCategories=require('./routes/admin_categories.js');
var adminProducts=require('./routes/admin_products.js');

app.use('/admin/pages',adminPages);
app.use('/admin/categories',adminCategories);
app.use('/admin/products',adminProducts);
app.use('/products',products);
app.use('/cart',cart);
app.use('/users',users);
app.use('/',pages);

//start the server
var port=3000;
app.listen(port,function(){
  console.log('server running on port '+port);
});
