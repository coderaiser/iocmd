#!/usr/bin/env node

'use strict';

let path            = require('path'),
    cloudcmd        = require('cloudcmd'),
    http            = require('http'),
    express         = require('express'),
    io              = require('socket.io'),
    session         = require('express-session'),
    bodyParser      = require('body-parser'),
    cookieParser    = require('cookie-parser'),
    flash           = require('connect-flash'),
    app             = express(),
    
    passport        = require('passport'),
    LocalStrategy   = require('passport-local').Strategy,
    
    readconfig      = require('../lib/readconfig'),
    encrypt           = require('../lib/encrypt'),
    socket,
    server,
    config          = readconfig();

const PORT          = process.env.IOCMD_PORT || 8000;
const pagesDir      = path.join(__dirname, '..', 'pages');
const loginDir      = path.join(pagesDir, 'login');
const loginPage     = path.join(loginDir, 'login.html');

passport.use(new LocalStrategy((username, password, done) => {
    let isUsername = username === config.username;
    let isPassword = encrypt(password) === config.password;
    
    if (isUsername && isPassword)  {
        done(null, {
            username: username,
            password: password
        });
    } else {
        done(null, false, Error('username or password not found'));
    }
}));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

let auth = passport.authenticate('local', {
    successRedirect: '/iocmd',
    failureRedirect: '/login',
    failureFlash: true
});

app.use(express.static(pagesDir));

app.use(flash());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'keyboard cat'
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/login', (req, res) => {
    console.log(req.flash('error'));
    res.sendFile(loginPage);
});

app.post('/login', auth);

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

let check = (req, res, next) => {
    req.isAuthenticated() ? next() : res.redirect('/login');
};

server = http.createServer(app);
socket = io.listen(server, {
    path: '/iocmd/socket.io'
});

app.use('/', [check, cloudcmd({
    socket: socket,
    config: {
        prefix: '/iocmd',
        auth: false
    }
})]);

server.listen(PORT, () => {
    console.log('url: http://%s:%d', 'localhost', PORT);
});
