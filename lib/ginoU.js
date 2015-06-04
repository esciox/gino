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
                    // server error

                    if (ginoU.isSet(result.responseJSON)) {

                        if(ginoU.isSet(result.responseJSON.status)) {
                            html +=      'Error ' + result.responseJSON.status;
                        }

                        if(ginoU.isSet(result.responseJSON.summary)) {
                            html +=      ' - ' + result.responseJSON.summary;
                        }

                        if(ginoU.isSet(result.responseJSON.raw)) {
                            html +=      ' - ' + result.responseJSON.raw.detail;
                        }

                        if(ginoU.isSet(result.responseJSON.detail)) {
                            html +=      ' - ' + result.responseJSON.detail;
                        }

                        if(ginoU.isSet(result.responseJSON.message)) {
                            html +=      ' - ' + result.responseJSON.message;
                        }

                        if(ginoU.isSet(result.responseJSON.model)) {
                            html +=      '<br>Model: ' + result.responseJSON.model;
                        }

                        if(ginoU.isSet(result.responseJSON.invalidAttributes)) {

                            for (field in result.responseJSON.invalidAttributes) {
                                html +=      '<br>Field ' + field + ':';

                                for(i=0, l=result.responseJSON.invalidAttributes[field].length; i<l; i++) {
                                    html +=      '<br>&nbsp;&nbsp;&nbsp; - ' + result.responseJSON.invalidAttributes[field][i].message;
                                }
                            }
                        }

                    // custom error
                    } else {
                        html +=      result;
                    }

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

                    // server error
                    if (ginoU.isSet(result.responseJSON)) {

                        if(ginoU.isSet(result.responseJSON.status)) {
                            html +=      'Error ' + result.responseJSON.status;
                        }

                        if(ginoU.isSet(result.responseJSON.summary)) {
                            html +=      ' - ' + result.responseJSON.summary;
                        }

                        if(ginoU.isSet(result.responseJSON.raw)) {
                            html +=      ' - ' + result.responseJSON.raw.detail;
                        }

                        if(ginoU.isSet(result.responseJSON.detail)) {
                            html +=      ' - ' + result.responseJSON.detail;
                        }

                        if(ginoU.isSet(result.responseJSON.message)) {
                            html +=      ' - ' + result.responseJSON.message;
                        }

                        if(ginoU.isSet(result.responseJSON.model)) {
                            html +=      '<br>Model: ' + result.responseJSON.model;
                        }

                        if(ginoU.isSet(result.responseJSON.invalidAttributes)) {

                            for (field in result.responseJSON.invalidAttributes) {
                                html +=      '<br>Field ' + field; + ':'

                                for(i=0, l=result.responseJSON.invalidAttributes[field].length; i<l; i++) {
                                    html +=      '&nbsp;&nbsp;&nbsp; - ' + result.responseJSON.invalidAttributes[field][i].message;
                                }
                            }
                        }


                    // custom error
                    } else {
                        html +=      result;
                    }
                    html += '</div>';

                    break;

            }


            // prepare text message
            if (type == 'ERROR') {

                // server error
                if (ginoU.isSet(result.responseJSON) &&
                    ginoU.isSet(result.responseJSON.raw)) {

                    txt += 'Error ' + result.status +
                    ' - ' + result.responseJSON.summary +
                    ' - ' + result.responseJSON.raw.detail;

                // custom error
                } else {
                    txt += 'Error ' + result.status +
                    ' - ' + result.statusText +
                    ' - ' + result.message;
                }

            } else {

                txt += result;
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

            /**
             *
             *
             */
            stringToBool : function ( text ) {

                if ( typeof text != 'string') return null;

                if( text == 'false' || text == 'FALSE' || text == '0')
                    return false;

                if( text == 'true' || text == 'TRUE' || text == '1')
                    return true;

                return undefined;
            },

            /**
             *
             *
             */
            toggleLoader : function( targetObj, action ) {

                var w=300, h=300,
                top= ($( window ).height()-h)/2,
                left= ($( window ).width()-w)/2,
                html='', offset={},
                fadeInTime = 700, fadeOutTime = 700;

                // set action
                var action = action || 'show';

                switch (action) {

                    case 'show':

                        if (this.isSet(targetObj)) {
                            // get target object dimensions
                            w = $(targetObj).outerWidth();
                            h = $(targetObj).outerHeight();

                            // get target object position
                            var offset = $(targetObj).offset();
                            top = offset.top + 'px;';
                            left = offset.left + 'px;';
                        }


                        // create div
                        html += '<div id="ginoLoader"';
                        html += ' style="';
                        html += ' background-color: #000000;';
                        html += ' color: #ffffff;';
                        html += ' opacity: 0.5;'
                        html += ' width:' + w + 'px;';
                        html += ' height:' + h + 'px;';
                        html += ' top:' + top + 'px;';
                        html += ' left:' + left + 'px;';
                        html += ' z-index: 10000;';
                        html += ' display: none;';
                        html += ' position: absolute;';
                        html += ' border:solid 4px #828282;';
                        html += ' border-radius:10px;';
                        html += ' font-weight: bold;';
                        html += ' font-size: 18px;';
                        html += '"';
                        html += '><div style="position: relative; top:130px; text-align: center;">...Loading...</div></div>';

                        // insert div in DOM model
                        $('body').append(html);

                        $('#ginoLoader').fadeIn(fadeInTime);

                        break;

                    case 'hide':
                        // remove div from DOM model
                        $('#ginoLoader').fadeOut(fadeOutTime, '', function(){
                            $(this).remove();
                        });

                        break;

                }
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
