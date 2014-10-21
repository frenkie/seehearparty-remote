
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var remoteUtil = require('./util');
var debug = require('debug')('seehearparty:remote');


var Remote = function ( socket ) {
    EventEmitter.call(this);

    this.socket = socket;

    this.socket.join('remotes', this.handleJoin.bind( this ));

    this.socket.on('nexttrackrequest', this.handleNextTrackRequest.bind( this ));
    this.socket.on('querychangerequest', this.handleQueryChangeRequest.bind( this ));
    this.socket.on('tagaddrequest', this.handleTagAddRequest.bind( this ));
    this.socket.on('tagremoverequest', this.handleTagRemoveRequest.bind( this ));
};

util.inherits( Remote, EventEmitter );

remoteUtil.extend( Remote.prototype, {

    getId : function () {
        return this.socket.id;
    },

    handleJoin : function ( err ) { },

    handleNextTrackRequest : function () {
        debug('next track request');
        this.emit('nexttrackrequest');
    },

    handleQueryChangeRequest : function ( query ) {
        debug('query change request');
        this.emit('querychangerequest', query );
    },

    handleTagAddRequest : function ( tag ) {
        debug('tag add request');
        this.emit('tagaddrequest', tag );
    },

    handleTagRemoveRequest : function ( tag ) {
        debug('tag remove request');
        this.emit('tagremoverequest', tag );
    }
});

module.exports = Remote;