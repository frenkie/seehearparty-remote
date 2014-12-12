
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var remoteUtil = require('./util');
var debug = require('debug')('seehearparty:receiver');


var Receiver = function ( socket, initializer ) {
    EventEmitter.call(this);

    this.socket = socket;
    this.initializer = initializer || false;

    this.bindEvents();
};

util.inherits( Receiver, EventEmitter );

remoteUtil.extend( Receiver.prototype, {

    bindEvents : function () {
        this.socket.on('statusupdate', this.handleStatusUpdate.bind(this) );

        this.socket.on('queryupdate', this.handleQueryUpdate.bind(this) );
        this.socket.on('tagupdate', this.handleTagUpdate.bind(this) );

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

        this.emit('statusupdate', status );
    },

    handleTagUpdate : function ( tags ) {
        debug('had a tags update');
        this.emit('tagupdate', tags );
    },

    isInitializer : function () {
        return this.initializer;
    },

    requestStatusUpdate : function () {
        this.socket.emit( 'statusrequest' );
    }
});

module.exports = Receiver;