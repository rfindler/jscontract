"use strict";
exports.__esModule = true;
var checksum = require("./index.ct.js");
var s = checksum("abcd");
var t = checksum("abcd", { algorithm: 'sha1' });
checksum.file("myfile.txt", function (error, hash) {
    // do nothing
});
checksum.file("myfile.txt", { algorithm: 'sha1' }, function (error, hash) {
    // do nothing
});
