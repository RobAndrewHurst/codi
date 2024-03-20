const fs = require('fs');

function helloCommon() {
    console.log('Hello world! I just commonJS');
}

module.exports = {
    helloCommon: helloCommon
};