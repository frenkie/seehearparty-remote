var EventEmitter = require('events').EventEmitter;
var express = require('express');
var minify = require('minify');
var util = require('util');
var remoteUtil = require('./util');

var debug = require('debug')('seehearparty:service');

var PartyController = require('./PartyController');
var Remote = require('./Remote');
var Receiver = require('./Receiver');


var Service = function ( expressInstance, socket ) {

    EventEmitter.call( this );

    this.server = expressInstance;
    this.socket = socket;

    this.parties = {};

    this.create();
    this.bindSocketEvents();
};

util.inherits( Service, EventEmitter );

remoteUtil.extend( Service.prototype, {

    bindSocketEvents : function () {

        this.socket.on('connection', function ( client ) {

            client.on('identify', this.handleClientIdentification.bind( this, client ) );

        }.bind(this) );
    },

    create : function () {

        this.createReceiverService();
        this.createStaticFileServices();
    },

    createPartyPlace : function ( name ) {
        this.parties[ name ] = new PartyController( this.socket, name );

        return this.parties[ name ];
    },

    createReceiverService : function () {

        this.server.get('/receiver.js', function ( req, res ) {

             minify( __dirname +'/receiver/receiver.js', function ( err, data ) {
                 if ( err ){
                     res.type('application/javascript');
                     res.send('alert(\'unable to get the receiver\')');

                 } else {
                     res.type('application/javascript');
                     res.send( this.replaceServerAddress( req, data ) );
                 }
             }.bind(this) );
        }.bind(this) );
    },

    createStaticFileServices : function () {

        this.server.use( '/remote', express.static( __dirname +'/remote' ) );
        this.server.use( express.static( __dirname +'/site' ) );
    },

    getPartyPlace : function ( name ) {
        return this.parties[ name ];
    },

    handleClientIdentification : function ( client, identity ) {

        var partyPlace;

        if ( identity && identity.type && identity.partyPlace ) {

            debug( 'identification request' );

            if ( ! this.hasPartyPlace( identity.partyPlace ) ) {

                partyPlace = this.createPartyPlace( identity.partyPlace );
            } else {
                partyPlace = this.getPartyPlace( identity.partyPlace );
            }

            client.join( identity.partyPlace );

            switch ( identity.type ) {

                case 'receiver':
                    debug( 'receiver identified' );
                    partyPlace.addReceiver( new Receiver( client, identity.initialized || false ) );
                    break;

                case 'remote':
                    debug( 'remote identified' );
                    partyPlace.addRemote( new Remote( client ) );
                    break;
            }
        } else {

            debug( 'incomplete identification request' );
        }
    },

    hasPartyPlace : function ( name ) {

        return !! ( this.parties[ name ] );
    },

    replaceServerAddress : function ( fromHttpRequest, inData ) {
        return inData.replace('{{SERVER}}', fromHttpRequest.protocol +'://'+ fromHttpRequest.get('host') );
    }
});

module.exports = Service;