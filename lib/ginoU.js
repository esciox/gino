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

        /**
         * @param {String} target Target HTML object area, to display message
         * @param {String} type Type of message ('ERROR', 'SUCCESS', 'INFO', 'WARNING', other)
         * @param {Object} result
         *
         */
        var _printMessage = function( target, type, result ){

            var html = '', txt = '', style_class = '';
            type = type.toUpperCase();

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

            // prepare HTML message
            html += '<div id="ginoMessage" class="ui ' + style_class + ' message">';
            html += '    <i class="close icon"></i>';
            // html += '    <div class="header">';
            // html +=         'Error ' + result.status + ' - ' + result.statusText;
            // html += '    </div>';
            html +=      result.responseJSON.message
            html += '</div>';

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
