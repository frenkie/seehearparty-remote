var express = require('express');
var Service = require('./Service');

var debug = require('debug')('seehearparty');
var app = express();
var server = require('http').Server( app );
var io = require('socket.io')( server );

var service = new Service( app, io );

var servePort = process.env.PORT || 3000;

server.listen( servePort );

debug('spinning on localhost:'+ servePort );