
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var remoteUtil = require('./util');
var debug = require('debug')('seehearparty:receiver');


var Receiver = function ( socket ) {
    EventEmitter.call(this);

    this.status = {
        query : '',
        tags : [],
        maxTags : 4
    };

    this.socket = socket;
    this.bindEvents();

    // get the initial status of tags and query
    this.socket.emit('statusrequest');
};

util.inherits( Receiver, EventEmitter );

remoteUtil.extend( Receiver.prototype, {

    addTag : function ( tag ) {
        this.socket.emit('addtag', tag );
    },

    bindEvents : function () {
        this.socket.on('statusupdate', this.handleStatusUpdate.bind(this) );

        this.socket.on('queryupdate', this.handleQueryUpdate.bind(this) );
        this.socket.on('tagupdate', this.handleTagUpdate.bind(this) );

        //this.socket.on('disconnect', this.handleReceiverDisconnect.bind(this) );
    },

    changeQuery : function ( query ) {
        this.socket.emit('changequery', query );
    },

    getId : function () {
        return this.socket.id;
    },

    getStatus : function () {
        return this.status;
    },

    handleQueryUpdate : function ( query ) {

        debug('received query update');

        this.status.query = query;
        this.emit('queryupdate', query );
    },

    handleReceiverDisconnect : function () {
        this.emit('disconnect');
    },

    handleStatusUpdate : function ( status ) {

        this.status = status;
        this.emit('statusupdate', this.status );
    },

    handleTagUpdate : function ( tags ) {

        debug('received tags update');

        this.status.tags = tags;
        this.emit('tagupdate', tags );
    },

    nextTrack : function () {
        this.socket.emit('nexttrack');
    },

    removeTag : function ( tag ) {
        this.socket.emit('removetag', tag );
    }
});

module.exports = Receiver;