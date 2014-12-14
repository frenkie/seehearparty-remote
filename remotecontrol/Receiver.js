
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var remoteUtil = require('./util');
var debug = require('debug')('seehearparty:receiver');


var Receiver = function ( socket, initialized ) {
    EventEmitter.call(this);

    this.socket = socket;
    this.initialized = initialized || false;

    this.bindEvents();
};

util.inherits( Receiver, EventEmitter );

remoteUtil.extend( Receiver.prototype, {

    bindEvents : function () {
        this.socket.on('statusupdate', this.handleStatusUpdate.bind(this) );

        this.socket.on('queryupdate', this.handleQueryUpdate.bind(this) );
        this.socket.on('tagupdate', this.handleTagUpdate.bind(this) );
        this.socket.on('trackupdate', this.handleTrackUpdate.bind(this) );

        //this.socket.on('disconnect', this.handleReceiverDisconnect.bind(this) );
    },

    getId : function () {
        return this.socket.id;
    },

    handleQueryUpdate : function ( query ) {

        debug('had a query update');
        this.emit('queryupdate', query );
    },

    handleReceiverDisconnect : function () {
        this.emit('disconnect');
    },

    handleStatusUpdate : function ( status ) {
        debug('had a status update');
        this.emit('statusupdate', status );
    },

    handleTagUpdate : function ( tags ) {
        debug('had a tags update');
        this.emit('tagupdate', tags );
    },

    handleTrackUpdate : function ( track ) {
        debug('had a track update');
        this.emit('trackupdate', track );
    },

    isInitialized : function () {
        return this.initialized;
    },

    requestStatusUpdate : function () {
        debug('requesting status update from initialized receiver');
        this.socket.emit( 'statusrequest' );
    }
});

module.exports = Receiver;