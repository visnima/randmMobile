var randmDirectives = angular.module('randm.directives', []);

randmDirectives.directive('ngModel', function( $filter ) {
    return {
        require: '?ngModel',
        link: function(scope, elem, attr, ngModel) {
            if( !ngModel )
                return;
            if( attr.type !== 'time' )
                return;
                    
            ngModel.$formatters.unshift(function(value) {
                return value.replace(/:\d{2}[.,]\d{3}$/, '')
            });
        }
    }   
});