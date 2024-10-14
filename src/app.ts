import {Express} from "express";
import http from "http";

var express = require('express');
var path = require('path');

var tilesRouter = require('./routes/tiles');

var app: Express = express();

//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/tiles', tilesRouter);

var server = http.createServer(app);
server.listen(8080, async() => {

});

module.exports = app;
