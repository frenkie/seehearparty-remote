angular.module( 'admin', [] )

    .factory( 'partyService', [ '$q', '$http', function ( $q, $http ) {

        var partyService;

        var PartyService = function () {};

        PartyService.prototype = {

            getParties : function () {

                return $q( function ( resolve, reject ) {

                    $http.get('api/parties' )
                        .then( function ( response ) {

                            if ( response && response.data ) {
                                resolve( response.data );
                            } else {
                                reject();
                            }

                        }, reject );
                });
            }
        };

        partyService = new PartyService();

        return partyService;
    }])

    .controller( 'PartyController', [ '$scope', 'partyService', function ( $scope, partyService ) {

            $scope.loaded = false;

            partyService.getParties().then( function ( parties ) {

                $scope.parties = parties;
                $scope.loaded = true;

            }, function () {
                $scope.parties = [];
                $scope.loaded = true;
            } );
        }]
    )

    .filter( 'join', function () {

        return function ( toJoin, glue ) {

            if ( toJoin && toJoin.length !== undefined && typeof toJoin !== 'string' ) {

                return toJoin.join( glue || ' ' );

            } else {
                return '';
            }
        };
    })

    .directive( 'seeParties', [ 'joinFilter', function () {

        return {
            templateUrl : 'views/seeParties.html',
            scope : {
                parties : '='
            }
        };
    }])
;