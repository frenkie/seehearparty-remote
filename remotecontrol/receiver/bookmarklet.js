(function () {
    function injectJs ( link ) {
        var scr = document.createElement('script');
        scr.type = 'text/javascript';
        scr.async = false;
        scr.src = link;
        (document.head || document.body || document.documentElement).appendChild( scr );
    }

    var remoteControlServer = prompt('Enter the http://host:port address of the remote control server');

    if ( remoteControlServer !== '' ) {
        injectJs( remoteControlServer + '/receiver.js' );
    }
})();