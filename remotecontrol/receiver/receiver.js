(function ( bookmarkletScript ) {

    function injectJs ( link, onLoad ) {
        var scr = document.createElement( 'script' );
        scr.type = 'text/javascript';
        scr.async = false;
        scr.src = link;

        if ( onLoad ) {
            scr.onload = onLoad;
        }

        (document.head || document.body || document.documentElement).appendChild( scr );
    }

    // rewrite SeeHearParty methods

        // onKick got an error if there we no more gif tags
    window.onKick = function() {

        if (beatHeldTime <= 0) {
            lastKickTime = Date.now();
            beatHeldTime = beatHoldTime;

            if ( gifSourcesReady.length ) {
                getRandomGifSource().displayRandomGif();
            }

            kickColor.a = 1.0;
            gifPlayerBG.r = Math.floor(255 - Math.random() * 200);
            gifPlayerBG.g = Math.floor(255 - Math.random() * 200);
            gifPlayerBG.b = Math.floor(255 - Math.random() * 200);
            gifPlayer.css({
                "background-color": gifPlayerBG.getString()
            })
        }
    };

    var Receiver = {

        init: function ( host ) {

            Receiver.host = host;
            Receiver.socket = io( host );

            Receiver.disableTagUpdateBroadcast = false;
                // this means a party has started, if not, this receiver will
                // get a
            Receiver.initialized = ( typeof window.gifTagEdit !== 'undefined' );

            Receiver.bindSocketEvents();

            if ( Receiver.initialized ) {
                Receiver.bindViewEvents();
            } else {
                // The receiver can be started manually, so prepare for that,
                // but it can also be started remotely through a 'statusupdate'.
                // Both should initialize the party but exclude each other.
                Receiver.bindManualStartEvent();
            }

            Receiver.identify();
        },

        bindManualStartEvent : function () {

            // manual call for startParty()
            window.$("#button-start").click(function () {

                Receiver.initialized = true;

                // timeout to make sure our view event binding succeeds
                setTimeout(function () {

                    Receiver.bindViewEvents();

                    // broadcast a status update
                    Receiver.handleStatusRequest();

                }, 100);
            });
        },

        bindSocketEvents: function () {
            Receiver.socket.on( 'statusrequest', Receiver.handleStatusRequest );

            // Requests from remotes
            Receiver.socket.on( 'changequery', Receiver.handleQueryChange );
            Receiver.socket.on( 'nexttrack', Receiver.handleNextTrack );
            Receiver.socket.on( 'addtag', Receiver.handleTagAdd );
            Receiver.socket.on( 'removetag', Receiver.handleTagRemove );

            // Updates from other receivers (or himself). These updates should only
            // be applied if not from self, they should not trigger any broadcasts.
            //Receiver.socket.on('queryupdate', Receiver.handleReceivingQueryUpdate); // not yet possible
            Receiver.socket.on('statusupdate', Receiver.handleReceivingStatusUpdate);
            Receiver.socket.on('tagupdate', Receiver.handleReceivingTagUpdate);
            Receiver.socket.on('trackupdate', Receiver.handleReceivingTrackUpdate);

            Receiver.socket.on( 'disconnect', Receiver.handleDisconnect );
        },

        bindViewEvents: function () {

            window.gifTagEdit.on( 'itemAdded itemRemoved', Receiver.handleTagUpdate );

            window.$('#tray .controls' ).click('.next', Receiver.handleTrackUpdate );
        },

        handleDisconnect: function () {
            var reconnect = confirm( 'Disconnected from See Hear Party, do you want to reconnect?' );

            if ( reconnect ) {
                Receiver.socket = io( Receiver.host );
                Receiver.identify();
            }
        },

        handleNextTrack: function () {
            window.controlsNextTrack();
        },

        handleQueryChange: function ( query ) {

            if ( query !== window.soundcloudAudio.key ) {
                window.soundDataSearch( query, function () {

                    // pause current audio
                    window.dancer.pause();

                    Receiver.socket.emit( 'queryupdate', query );
                    setTimeout( function () {
                        window.soundArgSuccess();
                        window.dancer.play();
                        window.updateTrackInfo();
                    }, 100 );
                }, function () {
                    Receiver.socket.emit( 'queryupdate', window.soundcloudAudio.key );
                    window.soundArgFailed();
                } );
            }
        },

        // only necessary to listen to if this Receiver hasn't been initialized yet,
        // it's a status update from an already initialized party receiver
        handleReceivingStatusUpdate : function ( status ) {

            if ( ! Receiver.initialized &&
                    status.tags && status.tags.length &&
                    status.query && status.query !== '' ) {

                Receiver.initialized = true;

                // setup a callback to initialize the party and receiver
                window.waitForParty = (function ( originalWaitForParty ) {

                    return function () {
                        originalWaitForParty();

                        window.startParty();

                        Receiver.bindViewEvents();
                    };

                })( window.waitForParty );

                // start loading GIFs and music search
                window.checkingArgs = true;
                window.gifDataSearch( status.tags, window.gifArgResponse );
                window.soundDataSearch( status.query, window.soundDataSuccess, window.soundDataFailed );
            }
        },

        handleReceivingTagUpdate : function ( tags ) {

            var currentTags;

            if ( Receiver.initialized ) {

                currentTags = window.gifTagEdit.tagsinput( 'items' ) || [];

                    // compare arrays despite the order of their values
                if ( ! ( window.$(currentTags).not(tags).length == 0 &&
                        window.$(tags).not(currentTags).length == 0 ) ) {

                    // disable tag update broadcasts during this change
                    Receiver.disableTagUpdateBroadcast = true;

                    window.gifTagEdit.tagsinput( 'removeAll' );

                    window.$.each( tags, function ( i, tag ) {
                        Receiver.handleTagAdd( tag );
                    });

                    Receiver.disableTagUpdateBroadcast = false;
                }
            }
        },

        handleReceivingTrackUpdate : function ( track ) {
            if ( Receiver.initialized && window.soundcloudAudio.streamUrl !== track ) {
                Receiver.handleNextTrack();
            }
        },

        handleStatusRequest: function () {

            var status = {
                tags: ( window.gifTagEdit ) ? window.gifTagEdit.tagsinput( 'items' ) : [],
                maxTags: window.MAX_GIF_TAGS || 4,
                query: ( window.soundcloudAudio ) ? window.soundcloudAudio.key : ''
            };

            Receiver.socket.emit( 'statusupdate', status );
        },

        handleTagAdd: function ( tag ) {

            if ( window.gifTagEdit &&  window.gifTagEdit.tagsinput( 'items' ).indexOf( tag ) === -1 ) {
                window.gifTagEdit.tagsinput( 'add', tag );
            }
        },

        handleTagRemove: function ( tag ) {

            if ( window.gifTagEdit && window.gifTagEdit.tagsinput( 'items' ).indexOf( tag ) !== -1 ) {
                if ( window.gifTagEdit.tagsinput( 'items' ).length == 1 ) {
                    // there is a bug in that the tagsinput won't remove an item if it's the
                    // only one left; also removeAll doesn't trigger a handleTagUpdate
                    window.gifTagEdit.tagsinput( 'removeAll' );
                    Receiver.handleTagUpdate();

                } else {
                    window.gifTagEdit.tagsinput( 'remove', tag );
                }
            }
        },

        handleTagUpdate: function () {
            if ( ! Receiver.disableTagUpdateBroadcast ) {
                Receiver.socket.emit( 'tagupdate', window.gifTagEdit.tagsinput( 'items' ) );
            }
        },

        handleTrackUpdate : function () {
            // the receiver want's to play the next track, broadcast this to all other receivers
            setTimeout( function () {

                Receiver.socket.emit( 'trackupdate', window.soundcloudAudio.streamUrl );

            }, 100 );
        },

        identify: function () {

            var partyPlace = prompt( 'Hey there! Please specify a party place you want to connect to!' );

            if ( partyPlace && partyPlace !== '' ) {

                Receiver.socket.emit( 'identify', {
                    type: 'receiver',
                    partyPlace: partyPlace,
                    initialized: Receiver.initialized
                } );
            }
        }
    };

    if ( bookmarkletScript ) {
        injectJs( bookmarkletScript.getAttribute('data-server') + '/socket.io/socket.io.js', function () {

            if ( window.io ) {
                Receiver.init( bookmarkletScript.getAttribute('data-server') );
            } else {
                alert( 'unable to connect' );
            }

        } );
    } else {
        alert('unable to execute bookmarklet; script reference missing!');
    }

})( document.getElementById('seehearparty-bookmarklet') );