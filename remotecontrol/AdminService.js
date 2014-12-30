var bodyParser = require('body-parser');
var EventEmitter = require('events').EventEmitter;
var express = require('express');
var session = require('express-session');
var util = require('util');

var remoteUtil = require('./util');

var config = require('../config.json');
var debug = require('debug')('seehearparty:admin');
var urlencodedParser = bodyParser.urlencoded({ extended: false });



var AdminService = function ( expressInstance, database ) {

    EventEmitter.call( this );

    this.server = expressInstance;
    this.database = database;

    this.createAdminService();
};

util.inherits( AdminService, EventEmitter );

remoteUtil.extend( AdminService.prototype, {

    createAdminService : function () {

        this.server.use( session({
            resave : false,
            saveUninitialized : false,
            secret : config.cookieSecret
        }) );

        //* Security Routing **/

        this.server.get('/admin/login', function ( req, res ) {
            res.sendFile( 'login.html', { root: __dirname +'/admin' } );
        });

        this.server.post('/admin/login', urlencodedParser, this.handleLogin.bind( this ) );

        this.server.get( /^\/admin\/?/, this.restrictAdminAccessOr('/admin/login' ).bind( this ) );


        this.server.use( '/admin', express.static( __dirname +'/admin' ) );


        //* API routing **/

        this.server.get('/admin/api/parties', this.handlePartyListing.bind( this ) );

        //* Admin Routing **/

        this.server.use( '/admin/vendor', express.static( __dirname +'/../node_modules' ) );
    },

    getAdminToken : function () {
        return config.adminUsername;
    },

    handleLogin : function ( req, res ) {
        var username = req.body.username;
        var password = req.body.password;

        if ( username === config.adminUsername && password === config.adminPassword ) {
            req.session.regenerate( function () {
                req.session.adminToken = this.getAdminToken();
                res.redirect( '/admin' );
            }.bind(this) );
        } else {
            res.redirect( '/admin/login' );
        }
    },

    handlePartyListing : function ( req, res ) {

        this.database.get( 'parties', function ( err, value ) {

            var parties = [];

            if ( err ) {
                res.json([]);
            } else {
                for ( var party in value ) {
                    parties.push({ name : party, created: new Date( value[ party ] ) })
                }
                res.json( parties );
            }
        });
/*
        res.json( [
            {
                name : 'frenkie',
                created : new Date( 1419888719000 ),
                lastModified : new Date( 1419888729000 ),
                activeTags : ['cat', 'dog'],
                tags : {
                    'hi': 1000,
                    'cat' : 100000,
                    'dog' : 50000,
                    'dolphin' : 200000
                },
                activeQuery : 'daft punk',
                queries : {
                    'daft punk' : 200000,
                    'funk' : 150000,
                    'hip hop' : 1000
                }
            },

            {
                name : 'robin',
                created : new Date( 1419828429000 ),
                lastModified : new Date( 1419828719000 ),
                activeTags : ['80s', 'cartoon'],
                tags : {
                    '80s' : 100000,
                    'cartoon' : 120000,
                    'joystick' : 20000,
                    'circles' : 40000
                },
                activeQuery : 'jamie xx',
                queries : {
                    'jamie xx' : 220000,
                    'aeroplane' : 20000,
                    'hip hop' : 40000
                }
            }
        ] );
        */
    },

    restrictAdminAccessOr : function ( redirect ) {

        return function ( req, res, next ) {

            if ( req.session.adminToken === this.getAdminToken() ) {
                next();
            } else {
                res.redirect( redirect );
            }
        }
    }
});

module.exports = AdminService;