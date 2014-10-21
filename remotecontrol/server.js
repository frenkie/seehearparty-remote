var express = require('express');
var minify = require('minify');

var RemoteController = require('./RemoteController');
var Remote = require('./Remote');
var Receiver = require('./Receiver');

var debug = require('debug')('seehearparty');
var app = express();
var server = require('http').Server( app );
var io = require('socket.io')( server );
var remoteController = new RemoteController( io );
var servePort = 3000;


app.get('/bookmarklet', function ( req, res ) {

    var error = 'error reading See Hear Party receiver bookmarklet';
    var success = '<h1>See Hear Party - bookmarklet</h1>'+
                  '<a href="javascript:{{bookmarklet}}">See Hear Party - Receiver</a> '+
                  ' Save the bookmarklet link and run it on http://www.seehearparty.com after starting the party.';

    minify( __dirname +'/receiver/bookmarklet.js', function ( err, data ) {
        if ( err ){
            res.send( error );

        } else {
            res.type('text/html');
            res.send( success.replace('{{bookmarklet}}', data.replace(/\"/ig, "'") )  );
        }
    });
});

app.get('/receiver.js', function ( req, res ) {

    minify( __dirname +'/receiver/receiver.js', function ( err, data ) {
        if ( err ){
            res.type('application/javascript');
            res.send('alert(\'unable to get the receiver\')');

        } else {
            res.type('application/javascript');
            res.send( data.replace('{{SERVER}}',
                                       req.protocol +'://'+ req.get('host')
                                     )
            );
        }
    });
});

app.use( express.static( __dirname +'/remote' ) );

io.on('connection', function ( socket ) {

    socket.on('identify', function ( identity ) {

        debug('identification request');

        switch ( identity ) {

            case 'receiver':
                debug('receiver identified');
                remoteController.addReceiver( new Receiver( socket ) );
                break;

            case 'remote':
                debug('remote identified');
                remoteController.addRemote( new Remote( socket ) );
                break;
        }
    })
});

server.listen( servePort );

debug('spinning on localhost:'+ servePort );