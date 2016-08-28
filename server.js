"use strict";

var express = require("express");
var bodyParser = require("body-parser");

var app = express();

app.use(express.static('wwwroot'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

require("./webcli")(app);

var server = app.listen(5000, function(){
    console.log("Listening on server " + server.address().port);
})