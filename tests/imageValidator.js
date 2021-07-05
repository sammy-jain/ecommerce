const { check } = require('express-validator');
var path = require('path');

var isImageVal = (value, filename) =>{
    var extention = (path.extname(filename)).toLocaleLowerCase();
    switch(extention){
        case '.jpg': return '.jpg'
        case '.jpeg': return '.jpeg'
        case '.png': return '.png'
        case '': return '.jpg'
        default: return false;        

        
    }
}

var isImage = module.exports = isImageVal;