'use strict';

let path        = require('path'),
    readjson    = require('readjson'),
    tryCatch    = require('try-catch'),
    
    exit        = require('./exit');

const dir   = require('os-homedir')();
const name  = '.cloudcmd.json';
const full  = path.join(dir, name);

module.exports = () => {
    let config;
    
    let error = tryCatch(() => {
        config = readjson.sync(full);
    });
    
    if (error && error.code !=='ENOENT')
        exit('iocmd: ', error.message);
    
    return config;
}
