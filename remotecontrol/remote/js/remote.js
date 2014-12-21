$(function () {

    var dl = document.location;
    var socketServer = dl.origin;
    var preParty; // URL can have a party name in the path

    if ( window.seeHearPartyConfig && window.seeHearPartyConfig.deployedOnOpenShift ) {

        socketServer = dl.protocol +'//'+ dl.hostname + ':8000';
    }

    if ( window.seeHearPartyConfig && window.seeHearPartyConfig.party ) {
        preParty = window.seeHearPartyConfig.party;
    }

    var Remote = {

        templates : {
            tag : '<span type="button" '+
                    ' class="tag btn btn-primary btn-sm" data-tag="{{tag}}">{{tag}} '+
                    ' <span class="tag-close glyphicon glyphicon-remove"></span></span>'
        },

        init : function ( host ) {

            Remote.host = host;
            Remote.socket = io( host );

            Remote.maxTagInput = 4;

            Remote.loader = $('.loader');

            Remote.partyPlace = $('.party-place');

            Remote.tagForm = $('.tag-form');
            Remote.tagInput = $('#tag-input');
            Remote.tagSubmit = Remote.tagForm.find('.submit');
            Remote.tagView = $('.tags');

            Remote.queryForm = $('.query-form');
            Remote.queryInput = $('#query-input');
            Remote.queryView = $('.query');

            Remote.nextTrack = $('.next-track');

            Remote.bindSocketEvents();
            Remote.bindViewEvents();

            Remote.identify();
        },

        bindSocketEvents : function () {
            Remote.socket.on('queryupdate', Remote.handleQueryUpdate);
            Remote.socket.on('statusupdate', Remote.handleStatusUpdate);
            Remote.socket.on('tagupdate', Remote.handleTagUpdate);

            Remote.socket.on('clearloadingstates', Remote.handleClearLoadingStates);


            Remote.socket.on('disconnect', Remote.handleDisconnect);
        },

        bindViewEvents : function () {

            Remote.queryForm.on('submit', Remote.handleQueryChangeRequest );

            Remote.tagForm.on('submit', Remote.handleTagAddRequest );
            Remote.tagView.on('click', '.tag', Remote.handleTagRemoveRequest );

            Remote.nextTrack.on('click', Remote.handleNextTrackRequest);
        },

        disableTagInput : function () {
            Remote.tagInput.prop('disabled', true );
            Remote.tagSubmit.prop('disabled', true );
        },

        disableTagRemoval : function () {
            Remote.tagView.addClass('disabled');
        },

        enableTagInput : function () {
            Remote.tagInput.prop('disabled', false );
            Remote.tagSubmit.prop('disabled', false );
        },

        enableTagRemoval : function () {
            Remote.tagView.removeClass('disabled');
        },

        handleClearLoadingStates : function () {
            Remote.setLoadingState(false);
        },

        handleDisconnect : function () {

            var reconnectMessage = '';

            if ( preParty ) {
                reconnectMessage = 'Disconnected from party '+  preParty+', do you want to reconnect?'
            } else {
                reconnectMessage = 'Disconnected from See Hear Party, do you want to reconnect?';
            }

            if ( confirm( reconnectMessage ) ) {
                Remote.socket = io( Remote.host );
                Remote.identify();
            }
        },

        handleNextTrackRequest : function () {
            Remote.socket.emit('nexttrackrequest');
        },

        handleQueryChangeRequest : function ( e ) {

            var query = Remote.queryInput.val();

            e.preventDefault();

            if ( query !== Remote.queryView.text() ) {

                Remote.setLoadingState(true);

                Remote.socket.emit('querychangerequest', query );

                Remote.queryInput.val('');
            }
        },

        handleQueryUpdate : function ( query ) {

            Remote.queryView.text( query );

            Remote.setLoadingState( false );
        },

        handleStatusUpdate : function ( data ) {

            Remote.setLoadingState( false );

            if ( data.maxTags ) {
                Remote.maxTagInput = data.maxTags;
            }

            Remote.handleTagUpdate( data.tags || [] );
            Remote.handleQueryUpdate( data.query || '' );
        },

        handleTagAddRequest : function ( e ) {

            var tag = Remote.tagInput.val();

            e.preventDefault();

            Remote.setLoadingState(true);

            Remote.socket.emit('tagaddrequest', tag);

            Remote.tagInput.val('');

        },

        handleTagRemoveRequest : function ( e ) {
            var tag = $( e.currentTarget );

            if ( ! Remote.tagView.is('.disabled') ) {
                Remote.setLoadingState( true );

                Remote.socket.emit( 'tagremoverequest', tag.data( 'tag' ) );
            }
        },

        handleTagUpdate : function ( tags ) {

            Remote.setTags( tags );

            if ( tags.length >= Remote.maxTagInput ) {

                Remote.disableTagInput();
            } else {
                Remote.enableTagInput();
            }

            if ( tags.length <= 1 ) {
                Remote.disableTagRemoval();
            } else {
                Remote.enableTagRemoval();
            }

            Remote.setLoadingState( false );
        },

        identify: function () {

            var partyPlace;

            if ( preParty ) {
                partyPlace = preParty;

            } else {
                partyPlace = prompt( 'Hey there! Please specify a party place you want to connect to!' );
            }

            if ( partyPlace && partyPlace !== '' ) {

                Remote.socket.emit( 'identify', {
                    type: 'remote',
                    partyPlace: partyPlace
                } );

                Remote.partyPlace.removeClass('hidden')
                        .html( 'controlling <a href="/remote/party/'+ partyPlace +'">'+ partyPlace +'</a>' );

            }
        },

        /**
         * @param {Boolean} toggle
         */
        setLoadingState : function ( toggle ) {
            Remote.loader[ ( toggle )? 'addClass' : 'removeClass' ]( 'loading' );
        },

        setTags : function ( tags ) {

            Remote.tagView.empty();

            $.each( tags, function ( i, tag ) {

                Remote.tagView.append( Remote.templates.tag.replace( /\{\{tag\}\}/ig, tag ) );
            });
        }
    };


    if ( window.io ) {
        Remote.init( socketServer );
    } else {
        $('.loader' ).html('unable to connect to See Hear Party Remote');
    }
});
