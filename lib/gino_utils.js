/**
 * $Id$
 *
 * Name:        gino_utils
 * File:        /lib/gino_utils.js
 * Author:      Alessandro Esciana <esciox@yahoo.it>
 * Requires:
 * Comment:
 *
 */

var ginoU = function(){

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

    };

}();