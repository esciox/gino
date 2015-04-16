/**
 * $Id$
 *
 * Name:        gino_client
 * File:        /lib/gino_client.js
 * Author:      Alessandro Esciana <esciox@yahoo.it>
 * Requires:    jquery, gino_utils
 * Comment:
 *
 */
var utils = require('./gino_utils.js');

var ginoC = function(){

    /**
     * @param {String} _container - Target container.
     *                             Must be in jquery format (#<ID> or .<CLASS_NAME>)
     * @param {String} _url       - Controller to call
     * @param {Number} _page      - Current page
     * @param {Number} _limit     - Results per page
     * @param {Array} _order      - Query order. Order format:
     *                             [
     *                                 {
     *                                     field: {String} <NAME>,
     *                                     sort: {String} <ASC/DESC>
     *                                 },
     *                             ]
     * @param {Array} _filter     - Query filter. Filter format:
     *                             [
     *                                 {
     *                                     condition: {String} <AND/OR>,
     *                                     field: {String} <NAME>,
     *                                     operator: {String} <OPERATOR>,
     *                                     value: {String} <COMPARITION VALUE>
     *                                 },
     *                             ]
     * @param {Bool} _enableFilter   - show filters for table
     * @param {Bool} _enableSort     - show sortable headers
     * @param {Array} _fieldMapping  - Array containing field mapping and labeling:
     *                                [
     *                                  {
     *                                     field: {String} <NAME>,
     *                                     label: {String} <LABEL>,
     *                                     render: {Function} anonymous function, usede to render
     *                                                        cell data. Must return a string
     *                                  }
     *                                ]
     * @param {Number} _count        - Number of record
     * @param {String} _filterQuery  - Url query to send to server
     * @param {String} _fQRowSep     - String to separate params in url query.
     *                                 Default "@,@"
     * @param {String} _fQFieldSep   - String used to separate filds from values in url query
     *                                 Default "@|@"
     */

    var _container, _url, _page, _limit, _order, _filter,
        _enableFilter, _enableSort, _fieldMapping, _count,
        _filterQuery, _fQRowSep, _fQFieldSep;


    /**
     * @function _error
     *
     * @private
     * @param {Object} jqXHR -
     * @param {String} textStatus -
     * @param {String} errorThrown -
     * @return
     */
    function _error( jqXHR, textStatus, errorThrown ) {

        // show message using utils
        // TODO rendere customizzabile il target
        utils.printMessage( '#appMessage', 'ERROR', jqXHR );

    }

    /**
     * @function _success
     *
     * @private
     * @param {Object} data - JSON object containing return data from server: html, count
     * @param {String} textStatus -
     * @param {Object} jqXHR -
     * @return
     */
    function _success( data, textStatus, jqXHR ) {

        // {status: 200, result: 'OK', message: 'User logged successfully'}
        var html = data.content.html;
        _count = data.content.count;

        // inject HTML into target container
        $(_container).html(html);

        // sets events for new table
        _setEvents(this);

    }

    /**
     * @function _checkFilter
     *
     * @private
     * @param {Object} target -
     * @return
     */
    function _checkFilter( target ) {

        var field = $(target).attr('id').replace('ginoFilter_', '' );
        var fieldValue = $(target).val();

        event.preventDefault();

        _filterQuery = field + _fQFieldSep + fieldValue;

    }

    /**
     * @function _checkOrder
     *
     * @private
     * @param {Object} target -
     * @return
     */
    function _checkOrder ( target ) {

        var _sort = $(target).data('sort');
        var _field = $(target).data('field');

        if (_sort == 'UNSET')_sort = 'ASC';
        else if (_sort == 'ASC') _sort = 'DESC';
        else if (_sort == 'DESC') _sort = 'UNSET';

        _order = [{field: _field, sort: _sort}];

    }

    /**
     * function _checkPagination
     *
     * @private
     * @param {Object} target -
     * @return
     */
    function _checkPagination( target ) {

        var url = $(target).data('url');
        var page_action = $(target).data('page_action');
        var max_page = _count % _limit > 0 ?
                        parseInt(_count / _limit) + 1 :
                        parseInt(_count / _limit);

        switch (page_action) {

            case 'first':

                _page  = 1;

                break;
            case 'less':

                _page  = _page > 1 ? _page - 1 : 1;

                break;
            case 'last':


                _page = max_page;

                break;
            case 'more':

                _page = _page < max_page ? _page + 1 : max_page;

                break;
            // number
            default:

                _page = page_action*1;

                break;

        }

    }

    /**
     * @function _setEvents
     * set events for table
     *
     * @private
     * @param {Object} objectTable -
     * @return
     */
    function _setEvents( objectTable ) {

        // events for order
        $('#ginoHeader a').on('click', function( event ){

            _checkOrder( this );

            objectTable.request();

            return false;
        });

        // events for filter
        $('input[id*="ginoFilter_"]').on('keydown', function( event ){

            if ( event.which == 13 ) {

                _checkFilter( this );

                objectTable.request();

            }

        });

        // events for pager
        $('#ginoPagination a').on('click', function(){

            _checkPagination( this );

            objectTable.request();

            return false;
        });

    }

    return {

        version : '0.0.1',

        /**
         * @function init
         * init function
         *
         * @param {Object} params - Available params: see description at the beginning of page
         * @return this
         */
        init : function ( params ){

            if ( !utils.isSetAndFull( params ) ) {

                console.error('Error on ginoC:  Missing parameters ');
                return;
            }

            if ( !utils.isSetAndFull( params.container ) ) {

                console.error('Error on ginoC:  Empty parameter: container ');
                return;
            }

            _container = params.container;
            _url   = params.url || '';
            _page  = params.page || 1;
            _limit = params.limit || 10;
            _order = params.order || [];
            _filter = params.filter || [];
            _enableFilter = params.enableFilter || false;
            _enableSort = params.enableSort || false;
            _fieldMapping = params.fieldMapping || {};
            _filterQuery = params.filterQuery || '';
            _fQRowSep = params.fQRowSep || '@,@',
            _fQFieldSep = params.fQFieldSep || '@|@',
            _count = 0;

            return this;
        },

        /**
         * @function toggleLoader
         * show / hide table loader
         *
         * @public
         */
        toggleLoader : function () {

            // TODO
        },

        /**
         * @function request
         * Send request to server
         *
         * @return
         */
        request : function () {

            // do the query
            $.ajax({
                url : _url,
                method: 'POST',
                dataType: 'json',
                context : this,
                data: {
                    url: _url,
                    page: _page,
                    limit: _limit,
                    order: _order,
                    filter: _filter,
                    enableFilter : _enableFilter,
                    enableSort : _enableSort,
                    fieldMapping : _fieldMapping,
                    filterQuery : _filterQuery,
                },
                error : _error,
                success : _success
            });

        }

    }

}