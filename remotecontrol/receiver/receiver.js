(function () {

    var SERVER = '{{SERVER}}';

    function injectJs ( link ) {
        var scr = document.createElement('script');
        scr.type = 'text/javascript';
        scr.async = false;
        scr.src = link;
        (document.head || document.body || document.documentElement).appendChild( scr );
    }

    var Receiver = {
         init : function ( host ) {

             Receiver.host = host;
             Receiver.socket = io( host );

             Receiver.bindViewEvents();
             Receiver.bindSocketEvents();

             Receiver.socket.emit('identify', 'receiver');
         },

         bindSocketEvents : function () {
             Receiver.socket.on('statusrequest', Receiver.handleStatusRequest);

             Receiver.socket.on('changequery', Receiver.handleQueryChange);
             Receiver.socket.on('nexttrack', Receiver.handleNextTrack);
             Receiver.socket.on('addtag', Receiver.handleTagAdd);
             Receiver.socket.on('removetag', Receiver.handleTagRemove);

             Receiver.socket.on('disconnect', Receiver.handleDisconnect);
         },

         bindViewEvents : function () {

             window.gifTagEdit.on('itemAdded itemRemoved', Receiver.handleTagUpdate );
         },

        handleDisconnect : function () {
            var reconnect = confirm('Disconnected from See Hear Party, do you want to reconnect?');

            if ( reconnect ) {
                Receiver.socket = io( Receiver.host );
                Receiver.socket.emit('identify', 'receiver');
            }
        },

         handleNextTrack : function () {

             window.controlsNextTrack();
         },

         handleQueryChange : function ( query ) {

             if ( query !== window.soundcloudAudio.key ) {
                 window.soundDataSearch(
                     query,
                     function () {

                         // pause current audio
                         window.dancer.pause();

                         Receiver.socket.emit( 'queryupdate', query );
                         setTimeout( function () {
                             window.soundArgSuccess();
                             window.dancer.play();
                             window.updateTrackInfo();
                         }, 100);
                     },
                     function () {
                         Receiver.socket.emit( 'queryupdate', window.soundcloudAudio.key );
                         window.soundArgFailed();
                     }
                 );
             }
         },

         handleStatusRequest : function () {

             var status = {
                 tags : ( window.gifTagEdit )? window.gifTagEdit.tagsinput('items') : [],
                 maxTags : window.MAX_GIF_TAGS || 4,
                 query : ( window.soundcloudAudio )? window.soundcloudAudio.key : ''
             };

             Receiver.socket.emit( 'statusupdate', status );
         },

         handleTagAdd : function ( tag ) {

             if ( window.gifTagEdit.tagsinput('items').indexOf( tag ) === -1 ) {
                 window.gifTagEdit.tagsinput('add', tag);
             }
         },

         handleTagRemove : function ( tag ) {

             if ( window.gifTagEdit.tagsinput('items').indexOf( tag ) !== -1 ) {
                 window.gifTagEdit.tagsinput('remove', tag);
             }
         },

         handleTagUpdate : function () {
             Receiver.socket.emit( 'tagupdate', window.gifTagEdit.tagsinput('items') );
         }
    };


    injectJs( SERVER + '/socket.io/socket.io.js' );

    setTimeout(function () {

        if ( window.io ) {
            Receiver.init( SERVER );
            alert('connected! Start partying!');
        } else {
            alert('unable to connect');
        }

    }, 1000);

})();