var express = require('express');
var router = express.Router();
var passport = require('passport');
var bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');


// Get Users model
var User = require('../models/user');

 // GET register

router.get('/register', function (req, res) {

    res.render('register', {
        title: 'Register',
        name: '',
        email: '',
        username: ''
    });

});


 // POST register

router.post('/register',[

    check('name', 'Name is required!').notEmpty(),
    check('email', 'Email is required!').isEmail(),
    check('username', 'Username is required!').notEmpty(),
    check('password', 'Password is required!').notEmpty(),
    check('password2').custom((val, {req})=>{
        if (req.password2 != req.password){
            throw new Error('Passwords do not match!');
        };
        return true;

    })
], function (req, res) {

    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    if(password!=password2){
      req.flash('danger', 'Password not matched!');
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        //console.log(errors);
        res.render('register', {
            errors: errors.errors,
            user: null,
            title: 'Register',
            name: name,
            email: email,
            username: username
        });
    } else {
        User.findOne({username: username}, function (err, user) {
            if (err)
                console.log(err);

            if (user) {
                req.flash('danger', 'Username exists, choose another!');
                // alert("Username exists, choose another!");
               // res.redirect('/users/register');
                res.render('register', {
                    errors: errors.errors,
                    user: null,
                    title: 'Register',
                    name: name,
                    email: email,
                    username: ''
                });
            } else {
                var user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password: password,
                    admin: 0
                });

                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(user.password, salt, function (err, hash) {
                        user.password = hash;

                        user.save(function (err) {
                            if (err) {
                                console.log(err);
                            } else {
                                // req.flash('success', 'You are now registered!');
                                res.redirect('/users/login')
                            }
                        });
                    });
                });
            }
        });
    }

});


// GET login

router.get('/login', function (req, res) {

    if (res.locals.user) res.redirect('/');

    res.render('login', {
        title: 'Log in'
    });

});


 //  POST login

router.post('/login', function (req, res, next) {

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);

});


 // GET logout

router.get('/logout', function (req, res) {

    req.logout();

    // req.flash('success', 'You are logged out!');
    res.redirect('/');

});

// Exports
module.exports = router;
