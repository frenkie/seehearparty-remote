
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var remoteUtil = require('./util');
var debug = require('debug')('seehearparty:partycontrol');

var PartyController = function ( broadcaster, partyPlace ) {

    EventEmitter.call(this);

    this.broadcaster = broadcaster;
    this.partyPlace = partyPlace;

    this.status = {
        maxTags : 4
    };
};

util.inherits( PartyController, EventEmitter );

remoteUtil.extend( PartyController.prototype, {

    addReceiver : function ( receiver ) {

        this.bindReceiverEvents( receiver );

        if ( receiver.isInitialized() ) {
            receiver.requestStatusUpdate();
        } else {
            this.broadcaster.to( receiver.getId() ).emit( 'statusupdate', this.status );
        }
    },

    addRemote : function ( remote ) {

        this.bindRemoteEvents( remote );
        this.broadcaster.to( remote.getId() ).emit( 'statusupdate', this.status );
    },

    bindReceiverEvents : function ( receiver ) {
        receiver.on('statusupdate', this.handleReceiverStatus.bind(this) );
        receiver.on('queryupdate', this.handleReceiverQueryUpdate.bind(this) );
        receiver.on('tagupdate', this.handleReceiverTagUpdate.bind(this) );
        receiver.on('trackupdate', this.handleReceiverTrackUpdate.bind(this) );

        receiver.on('disconnect', this.handleReceiverDisconnect.bind(this) );
    },

    bindRemoteEvents : function ( remote ) {

        remote.on('nexttrackrequest', this.handleRemoteNextTrackRequest.bind(this) );
        remote.on('querychangerequest', this.handleRemoteQueryChangeRequest.bind(this, remote) );
        remote.on('tagaddrequest', this.handleRemoteTagAddRequest.bind(this, remote) );
        remote.on('tagremoverequest', this.handleRemoteTagRemoveRequest.bind(this, remote) );
    },

        /*******************/
        /* Receiver events */

    handleReceiverDisconnect : function () {
        // ...
    },

    handleReceiverQueryUpdate : function ( query ) {

        if ( this.status.query !== query ) {
            debug( 'broadcasting query update' );

            this.status.query = query;

            this.broadcaster.to( this.partyPlace ).emit( 'queryupdate', query );
        } else {
            debug( 'query is unchanged' );
        }
    },

    handleReceiverStatus : function ( status ) {

        if ( status.query ) {
            this.status.query = status.query;
        } else {
            this.status.query = '';
        }

        if ( status.tags ) {
            this.status.tags = status.tags;
        } else {
            this.status.tags = [];
        }

        debug('broadcasting status update');
        this.broadcaster.to( this.partyPlace ).emit( 'statusupdate', this.status );
    },

    handleReceiverTagUpdate : function ( tags ) {

        tags = tags || [];

        var currentTags = this.status.tags || [];
        var tagsAreEqual = ( tags.length == currentTags.length &&
                        tags.every(function ( tag, i ) { return ( currentTags.indexOf( tag ) > -1 ) }) );

        if ( ! tagsAreEqual ) {
            debug( 'broadcasting tag update' );

            this.status.tags = tags;

            this.broadcaster.to( this.partyPlace ).emit( 'tagupdate', tags );
        } else {
            debug( 'tags are unchanged' );
        }
    },

    handleReceiverTrackUpdate : function ( track ) {
        debug('broadcasting track update');
        this.broadcaster.to( this.partyPlace ).emit( 'trackupdate', track);
    },

        /*****************/
        /* Remote events */

    handleRemoteNextTrackRequest : function () {
        debug('handling remote next track request');
        this.broadcaster.to( this.partyPlace ).emit('nexttrack');
    },

    handleRemoteQueryChangeRequest : function ( remote, query ) {
        debug('handling remote query change request');
        this.broadcaster.to( this.partyPlace ).emit( 'changequery', query );
    },

    handleRemoteTagAddRequest : function ( remote, tag ) {
        debug('handling remote tag add request');
        this.broadcaster.to( this.partyPlace ).emit( 'addtag', tag );
    },

    handleRemoteTagRemoveRequest : function ( remote, tag ) {
        debug('handling remote tag remove request');
        this.broadcaster.to( this.partyPlace ).emit( 'removetag', tag );
    }
});

module.exports = PartyController;