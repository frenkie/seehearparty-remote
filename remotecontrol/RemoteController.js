
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var remoteUtil = require('./util');
var debug = require('debug')('seehearparty:remotecontrol');

var profanityCheck = '(shit|porn|tit|dick|cock|sex|pussy|fuck|ass|breast|whore|piemel|lul|tiet|kont|kut)';
var profanityRegExp = new RegExp( profanityCheck, 'ig');

var RemoteController = function ( broadcaster ) {
    EventEmitter.call(this);

    this.broadcaster = broadcaster;
};

util.inherits( RemoteController, EventEmitter );

remoteUtil.extend( RemoteController.prototype, {

    addReceiver : function ( receiver ) {

        if ( this.receiver ) {
            // ...
            this.receiver.removeAllListeners();
        }

        this.receiver = receiver;
        this.bindReceiverEvents();
    },

    addRemote : function ( remote ) {

        var status;

        this.bindRemoteEvents( remote );

        if ( this.receiver ) {

            status = this.getStatus();

            this.broadcaster.to( remote.getId() ).emit('statusupdate', status );
        }
    },

    bindReceiverEvents : function () {
        this.receiver.on('statusupdate', this.handleReceiverStatus.bind(this) );
        this.receiver.on('queryupdate', this.handleReceiverQueryUpdate.bind(this) );
        this.receiver.on('tagupdate', this.handleReceiverTagUpdate.bind(this) );

        this.receiver.on('disconnect', this.handleReceiverDisconnect.bind(this) );
    },

    bindRemoteEvents : function ( remote ) {

        remote.on('nexttrackrequest', this.handleRemoteNextTrackRequest.bind(this) );
        remote.on('querychangerequest', this.handleRemoteQueryChangeRequest.bind(this) );
        remote.on('tagaddrequest', this.handleRemoteTagAddRequest.bind(this) );
        remote.on('tagremoverequest', this.handleRemoteTagRemoveRequest.bind(this) );
    },

    checkProfanity : function ( term ) {
        if ( profanityRegExp.test( term ) ) {
            debug('profanity input, dismissing');
            return false;
        }
        return true;
    },

    getStatus : function () {
        var status = {};

        if ( this.receiver ) {
            status = this.receiver.getStatus();
        }

        // add profanity check
        status.profanityCheck = profanityCheck;

        return status;
    },

        /*******************/
        /* Receiver events */

    handleReceiverDisconnect : function () {
        this.receiver.removeAllListeners();
        delete this.receiver;
    },

    handleReceiverQueryUpdate : function ( query ) {
        debug('broadcasting query update');
        this.broadcaster.to('remotes').emit('queryupdate', query);
    },

    handleReceiverStatus : function () {

        this.broadcaster.to('remotes').emit('statusupdate', this.getStatus() );
    },

    handleReceiverTagUpdate : function ( tags ) {
        debug('broadcasting tag update');
        this.broadcaster.to('remotes').emit('tagupdate', tags);
    },

        /*****************/
        /* Remote events */

    handleRemoteNextTrackRequest : function () {
        debug('handling remote next track request');
        if ( this.receiver ) {
            this.receiver.nextTrack();
        }
    },

    handleRemoteQueryChangeRequest : function ( query ) {
        debug('handling remote query change request');
        if ( this.checkProfanity( query ) && this.receiver ) {
            this.receiver.changeQuery( query );
        }
    },

    handleRemoteTagAddRequest : function ( tag ) {
        debug('handling remote tag add request');
        if ( this.checkProfanity( tag ) && this.receiver ) {
            this.receiver.addTag( tag );
        }
    },

    handleRemoteTagRemoveRequest : function ( tag ) {
        debug('handling remote tag remove request');
        if ( this.receiver ) {
            this.receiver.removeTag( tag );
        }
    }
});

module.exports = RemoteController;