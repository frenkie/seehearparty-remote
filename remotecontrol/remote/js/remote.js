$(function () {

    var Remote = {

        templates : {
            tag : '<span type="button" '+
                    ' class="tag btn btn-primary btn-sm" data-tag="{{tag}}">{{tag}} '+
                    ' <span class="tag-close glyphicon glyphicon-remove"></span></span>'
        },

        init : function () {
            
            Remote.socket = io();

            Remote.maxTagInput = 4;
            Remote.profanityCheck = /[^\w\s]+/ig; // will be replaced by the server

            Remote.loader = $('.loader');

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

            Remote.socket.emit('identify', 'remote');
        },

        bindSocketEvents : function () {
            Remote.socket.on('queryupdate', Remote.handleQueryUpdate);
            Remote.socket.on('statusupdate', Remote.handleStatusUpdate);
            Remote.socket.on('tagupdate', Remote.handleTagUpdate);
        },

        bindViewEvents : function () {

            Remote.queryForm.on('submit', Remote.handleQueryChangeRequest );

            Remote.tagForm.on('submit', Remote.handleTagAddRequest );
            Remote.tagView.on('click', '.tag', Remote.handleTagRemoveRequest );

            Remote.nextTrack.on('click', Remote.handleNextTrackRequest);
        },

        checkProfanity : function ( input ) {
            if ( Remote.profanityCheck.test( input ) ) {
                alert('that\'s not nice!');
                return false;
            }

            return true;
        },

        disableTagInput : function () {
            Remote.tagInput.prop('disabled', true );
            Remote.tagSubmit.prop('disabled', true );
        },

        enableTagInput : function () {
            Remote.tagInput.prop('disabled', false );
            Remote.tagSubmit.prop('disabled', false );
        },

        handleNextTrackRequest : function () {
            Remote.socket.emit('nexttrackrequest');
        },

        handleQueryChangeRequest : function ( e ) {

            var query = Remote.queryInput.val();

            e.preventDefault();

            if ( Remote.checkProfanity( query ) && query !== Remote.queryView.text() ) {

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

            if ( data.profanityCheck ) {
                Remote.profanityCheck = new RegExp( data.profanityCheck, 'ig' );
            }

            Remote.handleTagUpdate( data.tags || [] );
            Remote.handleQueryUpdate( data.query || '' );
        },

        handleTagAddRequest : function ( e ) {

            var tag = Remote.tagInput.val();

            e.preventDefault();

            if ( Remote.checkProfanity( tag ) ) {

                Remote.setLoadingState(true);

                Remote.socket.emit('tagaddrequest', tag);

                Remote.tagInput.val('');
            }
        },

        handleTagRemoveRequest : function ( e ) {
            var tag = $( e.currentTarget );

            Remote.setLoadingState( true );

            Remote.socket.emit('tagremoverequest', tag.data('tag') )
        },

        handleTagUpdate : function ( tags ) {

            Remote.setTags( tags );

            if ( tags.length >= Remote.maxTagInput ) {

                Remote.disableTagInput();

            } else {
                Remote.enableTagInput();
            }

            Remote.setLoadingState( false );
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
        Remote.init();
    }
});
