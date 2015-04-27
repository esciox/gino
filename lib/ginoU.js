/**
 * $Id$
 *
 * Name:        ginoU
 * File:        /lib/ginoU.js
 * Version      0.0.1
 * Author:      Alessandro Esciana <esciox@yahoo.it>
 * Requires:
 * Comment:
 *
 */


(function(){

    // global on the server, window in the browser
    var root = this;

    var ginoU = function(){

        var _cssEngine = '';// BOOTSTRAP or SEMANTIC

        /**
         * @param {String} target Target HTML object area, to display message
         * @param {String} type Type of message ('ERROR', 'SUCCESS', 'INFO', 'WARNING', other)
         * @param {Object} result
         *
         */
        var _printMessage = function( target, type, result ){

            var html = '', txt = '', style_class = '';
            type = type.toUpperCase();

            // prepare HTML message
            switch( _cssEngine ){

                case 'SEMANTIC':

                    // info banner style class
                    switch (type) {

                        case 'ERROR':
                            style_class = 'error';
                            break;

                        case 'SUCCESS':
                            style_class = 'positive';
                            break;

                        case 'INFO':
                            style_class = 'info';
                            break;

                        case 'WARNING':
                            style_class = 'warning';
                            break;

                        default:
                            style_class = 'info';
                            break;
                    }


                    html += '<div id="ginoMessage" class="ui ' + style_class + ' message">';
                    html += '    <i class="close icon"></i>';
                    // html += '    <div class="header">';
                    // html +=         'Error ' + result.status + ' - ' + result.statusText;
                    // html += '    </div>';
                    html +=      result.responseJSON.message
                    html += '</div>';

                    break;

                case 'BOOTSTRAP':

                    // info banner style class
                    switch (type) {

                        case 'ERROR':
                            style_class = 'alert-danger';
                            break;

                        case 'SUCCESS':
                            style_class = 'alert-success';
                            break;

                        case 'INFO':
                            style_class = 'alert-info';
                            break;

                        case 'WARNING':
                            style_class = 'alert-warning';
                            break;

                        default:
                            style_class = 'alert-info';
                            break;
                    }



                    html += '<div id="ginoMessage" class="alert ' + style_class + ' message">';
                    html += '    <button type="button" class="close" data-dismiss="alert" aria-label="Close">' ;
                    html += '       <span aria-hidden="true">&times;</span>';
                    html += '    </button>';
                    // html += '    <div class="header">';
                    // html +=         'Error ' + result.status + ' - ' + result.statusText;
                    // html += '    </div>';
                    html +=      result.responseJSON.message
                    html += '</div>';

                    break;

            }




            // prepare text message
            if (type == 'ERROR') {

                txt += 'Error ' + result.status +
                    ' - ' + result.statusText +
                    ' - ' + result.responseJSON.message;
            } else {

                txt += result.responseJSON.message;
            }

            // write on target
            if ($(target)) {

                $(target).html(html);

                $('#ginoMessage').fadeIn({duration: 1000, easing: 'swing'});

                // set close button
                $('#ginoMessage .close').on('click', function() {
                    $('#ginoMessage').fadeOut({duration: 1000, easing: 'swing'});
                });
            }

            // write on console
            console.error(txt);
        }


        return {

            version : '0.0.1',

            /**
             *
             *
             */
            init: function ( options ) {

                _cssEngine = options.cssEngine || 'SEMANTIC';

                return this;
            },

            /**
             *
             *
             */
            getParam : function( name ) {

                return this.isSet(eval(name)) ? eval(name) : null;
            },

            /**
             * returns true if variable is an Object
             *
             * @public
             * @param {Mixed} obj - variable to evaluate
             * @returns {Boolean} true/false
             */
            isArray : function (obj) {
                return obj.constructor.toString().indexOf('Array') > -1;
            },

            /**
             * returns true if variable is an Array
             *
             * @public
             * @param {Mixed} obj - variable to evaluate
             * @returns {Boolean} true/false
             */
            isObject : function (obj) {
                return obj.constructor.toString().indexOf('Object') > -1;
            },

            /**
             * returns true if variable exixts, otherwise false
             *
             * @public
             * @param {Mixed} obj - variable to evaluate
             * @returns {Boolean} true/false
             */
            isSet : function(obj){
                return typeof obj !== "undefined";
            },

            /**
             *
             *
             */
            isSetAndFull : function (obj) {

                if( !this.isSet( obj ) ||
                    obj == null ||
                    (this.isSet( obj ) && typeof obj == 'string' && obj.trim() == '')
                  ) {
                    return false;
                } else {
                    return true;
                }
            },

            /**
             *
             *
             */
            printMessage : function( target, type, result ) {

                _printMessage( target, type, result );

            },

        };

    }();

    // Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ginoU;
    }
    // included directly via <script> tag
    else {
        root.ginoU = ginoU;
    }

}());
