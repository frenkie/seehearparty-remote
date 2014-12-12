(function () {

    var scr = document.createElement('script');
        scr.type = 'text/javascript';
        scr.async = false;
        scr.src = '{{SERVER}}/receiver.js';

    ( document.head || document.body || document.documentElement ).appendChild( scr );

})();