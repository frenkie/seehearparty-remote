var express = require('express');
var Service = require('./Service');

var debug = require('debug')('seehearparty');
var app = express();
var server = require('http').Server( app );
var io = require('socket.io')( server );

var service = new Service( app, io );

var serveIp = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var servePort = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000;

if ( process.env.OPENSHIFT_NODEJS_PORT ) {
    debug('OpenShift deployment');
}

server.listen( servePort, serveIp, function () {

    debug('spinning on '+ serveIp +':'+ servePort );
});