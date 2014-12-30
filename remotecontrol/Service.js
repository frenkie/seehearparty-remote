var EventEmitter = require('events').EventEmitter;
var express = require('express');
var util = require('util');
var remoteUtil = require('./util');

var debug = require('debug')('seehearparty:service');

var PartyController = require('./PartyController');
var Remote = require('./Remote');
var Receiver = require('./Receiver');


var Service = function ( expressInstance, socket, database ) {

    EventEmitter.call( this );

    this.server = expressInstance;
    this.socket = socket;
    this.database = database;

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

        this.createConfigService();
        this.createStaticFileServices();
    },

        // OpenShift.org needs specific WebSocket settings in client connections
    createConfigService : function () {

        var respond = function ( party ) {
            var config = 'var seeHearPartyConfig = { deployedOnOpenShift : '+
                    ( ( process.env.OPENSHIFT_NODEJS_PORT ) ? 'true' : 'false' );

            if ( party ) {
                config += ', party: "'+ party +'" }';
            } else {
                config += '}';
            }

            return config;
        };

        this.server.get( '/remote/party/:party/config.js', function ( req, res ) {

            res.type('application/javascript');
            res.send( respond( req.params.party ) );
        });

        this.server.get( /(remote\/)?config\.js/, function ( req, res ) {

            res.type('application/javascript');
            res.send( respond() );
        });
    },

    createPartyPlace : function ( name ) {
        this.parties[ name ] = new PartyController( this.socket, name );

        // TODO: I don't think this will work async with a lot of connects

        this.database.get( 'parties', function ( err, value ) {

            var now = ( new Date() ).getTime();

            if ( err || ( ! err && ! value[ name ] ) ) {

                value = value || {};
                value[ name ] = now;

                this.database.batch([
                    { type: 'put', key: 'parties', value: value  },
                    { type: 'put', key: name +'_lastModified', value: now }
                ], this.handleDatabaseCallback.bind( this ) );

            } else {

                this.database.put( name +'_lastModified', now, this.handleDatabaseCallback.bind( this ) );
            }
        }.bind( this ) );

        return this.parties[ name ];
    },

    createStaticFileServices : function () {

        this.server.use( '/remote/party/:party', express.static( __dirname +'/remote' ) );
        this.server.use( '/receiver', express.static( __dirname +'/receiver' ) );
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

    handleDatabaseCallback : function ( err ) {
        if ( err ) {
            debug( err );
        }
    },

    hasPartyPlace : function ( name ) {

        return !! ( this.parties[ name ] );
    }
});

module.exports = Service;