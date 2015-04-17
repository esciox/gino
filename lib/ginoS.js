/**
 * $Id$
 *
 * Name:        ginoS
 * File:        /lib/ginoS.js
 * Author:      Alessandro Esciana <esciox@yahoo.it>
 * Requires:    ginoU
 * Comment:
 *
 */

var ginoU = require('./ginoU.js');

module.exports = function() {

    return {

        version: '0.0.1',

        breadcrumb : (function(){

            return {

                cssEngine: '',  // BOOTSTRAP or SEMANTIC
                arrayLinks: [], // links required. {String} or {Object} accepted

                /**
                 * @param {Array} options List of options available
                 *                        {String} or {Object} accepted.
                 *                        String => label to print
                 *                        Object => {String} href Path to link to
                 *                                  {String} title Title to show on link
                 *                                  {String} label Label to show as link
                 */
                init: function( options ) {

                    this.cssEngine = options.cssEngine || 'SEMANTIC';
                    this.arrayLinks = options.arrayLinks || [];

                    if (this.arrayLinks.length == 0) {
                        console.warn('Warning on TilabBreadcrumb:  Empty parameter: arrayLinks ');
                    }

                    return this;
                },

                render: function () {

                    var html = '',
                        linkType = ''
                        _href = '',
                        _title = '',
                        _label = '';


                    html += '<div id="TilabBreadcrumb" class="ui breadcrumb">';

                    for (i=0, l=this.arrayLinks.length; i<l; i++) {

                        linkType = typeof this.arrayLinks[i];

                        switch (linkType) {

                            case 'string' :

                                switch (this.cssEngine) {

                                    case 'SEMANTIC':
                                        html += '<div class="active section">' + this.arrayLinks[i] + '</div>';
                                        break;

                                    case 'BOOTSTRAP':

                                        html += '<div class="active section">' + this.arrayLinks[i] + '</div>';
                                        break;
                                }

                                break;

                            case 'object' :

                                if(typeof this.arrayLinks[i].href == 'undefined') {
                                    console.warn('Warning on TilabBreadcrumb:  Missing parameter: href ');
                                } else {
                                    _href = this.arrayLinks[i].href;
                                }

                                if (typeof this.arrayLinks[i].title == 'undefined') {
                                    console.warn('Warning on TilabBreadcrumb:  Missing parameter: title ');
                                } else {
                                    _title = this.arrayLinks[i].title;
                                }

                                if(typeof this.arrayLinks[i].label == 'undefined') {
                                    console.warn('Warning on TilabBreadcrumb:  Missing parameter: label ');
                                } else {
                                    _label = this.arrayLinks[i].label;
                                }

                                switch (this.cssEngine) {

                                    case 'SEMANTIC':

                                        html += '<a class="section" href="' + _href +
                                        '" title="' + _title +
                                        '">' + _label +
                                        '</a>';
                                        break;

                                    case 'BOOTSTRAP':

                                        html += '<a class="section" href="' + _href +
                                        '" title="' + _title +
                                        '">' + _label +
                                        '</a>';
                                        break;
                                }

                                break;
                        }

                        // add spacer
                        if (i+1 < l) {

                            html += '<i class="right chevron icon divider"></i>';
                        }


                    } // end for

                    html += '</div>';

                    // console.log(html);

                    return html;

                }


            };

        }()), // end breadcrumb

        grid : (function(){

            var _cssEngine =  'SEMANTIC',  // BOOTSTRAP or SEMANTIC
            _url     = '',
            _model   = {},
            _sql     = '',
            _page    = 1,
            _limit   = 10,
            _order   = [],
            _filter  = [],
            _enableFilter    = false,
            _enableSort      = false,
            _fieldMapping    = {},
            _filterQuery     = '',
            _fQRowSep        = '@,@',
            _fQFieldSep      = '@|@',
            _fQInternal      = [];


            /**
             * @function createCondition
             * Create condition in a compatible format for Waterline ORM.
             * Take params from url query and from configuration
             * Filters from query, for default, are built with 'LIKE' operator and 'AND' condition
             *
             * admitted operators:
             * '<' / 'lessThan'
             * '<=' / 'lessThanOrEqual'
             * '>' / 'greaterThan'
             * '>=' / 'greaterThanOrEqual'
             * '!' / 'not'
             * 'like'
             * 'contains'
             * 'startsWith'
             * 'endsWith'
             *
             * @private
             * @return {Object}
             *
             */
            var _createCondition = function () {

                var cond = {};
                var i,l, tmp, tmp2;
                tmp = _filterQuery.split(_fQRowSep);


                // FILTER COMING FROM QUERY
                // as default, filters from query are
                // always in "like" operator and "AND" condition
                for ( i=0, l=tmp.length; i<l; i++ ) {

                    // tmp2[0] => field
                    // tmp2[1] => value
                    tmp2 = tmp[i].split(_fQFieldSep);

                    if ( !ginoU.isSetAndFull(tmp2[0]) ) {

                        console.warn('Warning on ginoS:  filter field not set, skipping filter ');
                        continue;
                    }

                    if ( !ginoU.isSetAndFull(tmp2[1]) ) {

                        console.warn('Warning on ginoS:  filter value not set, skipping filter ');
                        continue;
                    }

                    _fQInternal[tmp2[0]] = tmp2[1];

                    cond[tmp2[0]] = eval("{like : tmp2[1]}");

                }


                // FILTERS FROM CONFIG
                for ( i=0 , l=_filter.length; i<l; i++ ) {

                    tmp = _filter[i];

                    if ( !ginoU.isSetAndFull(tmp.condition) ) {

                        console.warn('Warning on ginoS:  filter condition not set, assuming AND ');
                    }

                    if ( !ginoU.isSetAndFull(tmp.field) ) {

                        console.warn('Warning on ginoS:  filter field not set, skipping filter ');
                        continue;
                    }

                    if ( !ginoU.isSetAndFull(tmp.operator) ) {

                        console.warn('Warning on ginoS:  filter operator not set, skipping filter ');
                        continue;
                    }

                    if ( !ginoU.isSet(tmp.value) ) {

                        console.warn('Warning on ginoS:  filter value not set, skipping filter ');
                        continue;
                    }

                    switch(filter[i].condition) {

                        case 'AND':

                            cond[tmp.field] = eval("{tmp.operator : tmp.value}");

                            break;

                        case 'OR':

                            cond.or = eval("{tmp.field: {tmp.operator : tmp.value}}");

                            break;

                    }

               }

               return cond;

            };


            /**
             * @function createSorting
             * Create sort condition compatible with Waterline ORM
             *
             * @private
             * @return {Object}
             */
            var _createSorting = function () {

                var sort = {};

                for ( var i=0 , l=_order.length; i<l; i++ ) {

                    tmp = _order[i];

                    if ( !ginoU.isSetAndFull(tmp.field) ) {

                        console.warn('Warning on ginoS:  ordering field not set, skipping order ');
                        continue;
                    }

                    if ( !ginoU.isSetAndFull(tmp.sort) ) {

                        console.warn('Warning on ginoS:  ordering sort not set, assuming ASC ');
                        tmp.sort = 'ASC';
                    }

                    switch ( tmp.sort ) {

                        case 'ASC':
                            sort[tmp.field] = 1;
                            break;

                        case 'DESC':
                            sort[tmp.field] = 0;
                            break;

                        case 'UNSET':
                            // skip
                            break;
                    }
                }

                // if there's no sort, add a default, using first field ASC
                if ( Object.keys(sort).length == 0 ) {

                    sort[_fieldMapping[0].field] = 1;
                }

                return sort;

            };

            /**
             * @function parse
             * Parse results, create HTML table and related objects
             *
             * @private
             * @return {JSON Object} - html {String} HTML output
             *                       - count {Number} number of records
             */
            var _parse = function ( count, results ){

                var htmlBlock = '',
                    htmlTable = '',
                    htmlPagination = '',
                    tableClass = '';

                switch ( _cssEngine ) {
                    case 'SEMANTIC':

                        tableClass = 'ui celled striped table';

                        break;
                    case 'BOOTSTRAP':
                        // TODO
                        break;
                }

                // TABLE
                htmlTable += '<table id="ginoTable" class="' + tableClass + '">';
                htmlTable += _tableHead();
                htmlTable += _tableBody( results );
                htmlTable += '</table>';

                // PAGINATION
                htmlPagination += _createPagination( count );

                // FINAL BLOCK
                htmlBlock += htmlTable + htmlPagination;

                return {
                    html: htmlBlock,
                    count: count
                };

            };

            /**
             * @function tableHead
             * Create table head
             *
             * @private
             * @return {String} - HTML thead tag
             */
            var _tableHead = function () {

                var htmlTableHead = '';


                htmlTableHead += '  <thead id="ginoHeader">';
                htmlTableHead += '  <tr>';

                // ORDERED HEADER
                if ( _enableSort ) {

                    htmlTableHead += _createOrders();

                // STANDARD HEADER
                } else {

                    for( var i=0, l=_fieldMapping.length; i<l; i++ ) {

                        htmlTableHead += "<th>" + _fieldMapping[i].label + "</th>";
                    }

                }

                htmlTableHead += '  </tr>';


                // FILTERS HEADER
                // show filters if availables
                if ( _enableFilter ) {

                    htmlTableHead += _createFilters();
                }

                htmlTableHead += '  </thead>';

                return htmlTableHead;

            };

            /**
             * @function tableBody
             * Create table body
             *
             * @private
             * @param {Array} results - Array containing result objects
             * @return {String} HTML body tag
             */
            var _tableBody = function ( results ) {

                var results = results || [];
                var htmlTableBody = '', value = '';

                htmlTableBody += '  <tbody>';

                // filter on required params
                for ( var m=0, n=results.length; m<n; m++ ) {

                    htmlTableBody += "<tr>";

                    for( var i=0, l=_fieldMapping.length; i<l; i++ ) {

                        // reset value
                        value = ''

                        // render with function
                        // function need following params:
                        // value => value to format
                        // results => data array
                        // m => row counter
                        if (ginoU.isSet(_fieldMapping[i].render)) {

                            // eval is evil...
                            var func = eval('[' + _fieldMapping[i]['render'] + ']')[0];

                            // TODO check input parameters and add warning/errors

                            value = func(results[m][_fieldMapping[i].field], results, m);

                        // normal render
                        } else {

                            value = results[m][_fieldMapping[i].field];
                        }

                        htmlTableBody += "<td>" + value + "</td>";

                    }

                    htmlTableBody += "</tr>";

                }

                htmlTableBody += '  </tbody>';

                return htmlTableBody;

            };

            /**
             * @function createPagination
             * create pagination HTML
             *
             * @private
             * @param {Number} count - total number of rows
             * @return {String} - HTML pagination stuff
             */
            var _createPagination = function ( count ){

                var page = _page;
                var limit = _limit;
                var count = count;
                var boxes = (count % limit) > 0 ? parseInt(count / limit) + 1 : parseInt(count / limit);
                var html = '', contClass = '', itemClass = '',
                    activeClass = "", recordMsg = '', paginationMsg = '';

                switch ( _cssEngine ) {
                    case 'SEMANTIC':

                        contClass = 'ui borderless pagination menu';
                        itemClass = 'item';

                        break;
                    case 'BOOTSTRAP':

                        // TODO

                        break;
                }

                recordMsg = 'Record found: <b>' + count + '</b>';
                paginationMsg = 'Page <b>' + page + '</b> of <b>' + boxes + '</b>';


                // only if we have more than one page
                if(count > limit) {

                    html += '<div>' + recordMsg + ' - ' + paginationMsg + '<br/><br/></div>';

                    html += '<div id="ginoPagination" class="' + contClass + '">';

                    html += '<a class="' + itemClass + '" data-url="' + _url + '" data-page_action="first" >&lt;&lt;</a>';
                    html += '<a class="' + itemClass + '" data-url="' + _url + '" data-page_action="less" >&lt;</a>';

                    for (var i=1, l=boxes; i<=l; i++) {

                        switch ( _cssEngine ) {
                            case 'SEMANTIC':

                                activeClass = (i == page) ? ' active ' : '';

                                break;
                            case 'BOOTSTRAP':

                                // TODO

                                break;
                        }

                        html += '<a class="' + itemClass + activeClass + '" data-url="' + _url + '" data-page_action="' + i + '" >' + i + '</a>';

                    }

                    html += '<a class="' + itemClass + '" data-url="' + _url + '" data-page_action="more" >&gt;</a>';
                    html += '<a class="' + itemClass + '" data-url="' + _url + '" data-page_action="last" >&gt;&gt;</a>';

                    html += '</div>';

                } else {

                    html += '<div>' + recordMsg + '<br/><br/></div>';

                }

                return html;

            };

            /**
             * @function createFilters
             * Create filter code
             *
             * @private
             * @return {String} - HTML code for filters
             */
            var _createFilters = function (){

                var html = '', fieldClass = '', filterValue = '';

                // filter on required params
                for( var i=0, l=_fieldMapping.length; i<l; i++ ) {

                    filterValue = '';

                    switch ( _cssEngine ) {
                        case 'SEMANTIC':

                            fieldClass = 'two wide ui mini input';

                            break;
                        case 'BOOTSTRAP':

                            // TODO
                            break;
                    }

                    // set search value if present
                    if(ginoU.isSet(_fQInternal[_fieldMapping[i].field])) {
                        filterValue = _fQInternal[_fieldMapping[i].field];
                    }


                    html += '<th>' +
                                     '<div class="' + fieldClass +
                                     '">' +
                                     '<input type="text"' +
                                     'id="ginoFilter_' + _fieldMapping[i].field +
                                     '" name="ginoFilter_' + _fieldMapping[i].field +
                                     '" value="' + filterValue +
                                     '" style="width:100%">' +
                                     '</div>' +
                                     '</th>';
                }

                // unset internal data
                _fQInternal = [];

                return html;

            };

            /**
             * @function createOrders
             * Create HTML table head to order grid
             *
             * @private
             * @return {String} - HTML code to order grid results
             */
            var _createOrders = function (){

                var html = '', sort = 'UNSET';

                for( var i=0, l=_fieldMapping.length; i<l; i++ ) {

                    for ( var m=0 , n=_order.length; m<n; m++ ) {
                        if ( _order[m].field == _fieldMapping[i].field) {
                            sort = _order[m].sort;
                        }
                    }

                    html +=    '<th><a href="" data-field="' +
                                    _fieldMapping[i].field +
                                    '" data-sort="' + sort + '" >' +
                                    _fieldMapping[i].label +
                                    '</a></th>';
                }

                return html;
            };


            return {

                version : '0.0.1',

                /**
                 * @function init
                 * init function
                 *
                 * @public
                 * @param {Object} params - Object containing configuration params:
                 *                          - url           {String} - controller/action source. Required
                 *                          - model         {Object} - Model used to query. Required
                 *                          - sql           {String} - Custom query (TODO)
                 *                          - page          {Number} - Current page (used in query)
                 *                          - limit         {Number} - Results per page (used in query)
                 *                          - order         {Array}  - List of field used for order
                 *                          - filter        {Array}  - List of field used for filtering query
                 *                          - enableFilter  {Bool}   - Enable filter function (on all fields)
                 *                          - enableSort    {Bool}   - Enable sort function (on all fields)
                 *                          - fieldMapping  {Array}  - list of requested fields. Params available:
                 *                                                      - field {String}    - Name of field
                 *                                                      - label {String}    - Label to show on grid
                 *                                                      - render {Function} - custom function to render value
                 *                                                                            By default this function receive 3 params:
                 *                                                                            - value {String} - input string to render
                 *                                                                            - results {Array} - resultset
                 *                                                                            - row (Number) - current row
                 *                          - filterQuery   {String}
                 *
                 * @return {Object} object ginoS
                 */
                init : function ( params ){

                    if ( !ginoU.isSetAndFull(params) ) {

                        console.error('Error on ginoS:  Missing parameters ');
                        return;
                    }

                    if ( !ginoU.isSetAndFull(params.url) ) {

                        console.error('Error on ginoS:  Missing url ');
                        return;
                    }

                    if ( !ginoU.isSetAndFull(params.model) ) {

                        console.error('Error on ginoS:  Missing model ');
                        return;
                    }

                    _url   = params.url;
                    _model = eval(params.model);
                    _sql   = params.sql || _sql;
                    _page  = params.page || _page;
                    _limit = params.limit || _limit;
                    _order = params.order || _order;
                    _filter = params.filter || _filter;
                    _enableFilter = params.enableFilter || _enableFilter;
                    _enableSort = params.enableSort || _enableSort;
                    _fieldMapping = params.fieldMapping || _fieldMapping;
                    _filterQuery = params.filterQuery || _filterQuery;

                    return this;
                },


                /**
                 * @function reqHandler
                 * main function, does the request on DB and returns an HTML table
                 *
                 * @public
                 * @param {Function} callback - return callback (number of rows, result object )
                 */
                reqHandler : function (callback){

                    var output = null;
                    // TODO customizzabile, per permettere la count anche da query
                    var count = 0;
                    var Model = _model;
                    var where = _createCondition();
                    var sort = _createSorting();
                    var page = _page;
                    var limit = _limit;
                    var that = this;


                    Model.count({
                        where   : where
                    }).exec(function (err, counter){

                        // TODO
                        //if (err) return res.serverError(err);

                        count = counter;

                        // do query, on callback parse result
                        Model.find({
                            where   : where,
                            sort    : sort,
                        }).paginate({
                            page    : page,
                            limit   : limit,
                        }).exec(function (err, results){

                            // TODO
                            //if (err) return res.serverError(err);

                            // create table
                            callback(null, _parse( count, results ) );

                        });

                    });

                },


            };


        }()), // end grid

    } // end object

}();