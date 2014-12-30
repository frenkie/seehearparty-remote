var express = require('express');
var levelup = require('level');
var Service = require('./Service');
var AdminService = require('./AdminService');

var app = express();
var config = require('../config.json');
var database = levelup( __dirname +'/'+ config.database, { valueEncoding : 'json' } );
var debug = require('debug')('seehearparty');

var server = require('http').Server( app );
var io = require('socket.io')( server );

var service = new Service( app, io, database );
var adminService = new AdminService( app, database );

var serveIp = process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
var servePort = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000;

if ( process.env.OPENSHIFT_NODEJS_PORT ) {
    debug('OpenShift deployment');
}

server.listen( servePort, serveIp, function () {

    debug('spinning on '+ serveIp +':'+ servePort );
});