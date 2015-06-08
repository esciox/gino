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

        ginoU: ginoU,

        Breadcrumb : function(){

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
                        console.warn('Warning on ginoBreadcrumb:  Empty parameter: arrayLinks ');
                    }

                    return this;
                },

                render: function () {

                    var html = '',
                        linkType = ''
                        _href = '',
                        _title = '',
                        _label = '';

                    switch(this.cssEngine) {

                        default:
                        case 'SEMANTIC':

                            html += '<div id="ginoBreadcrumb" class="ui breadcrumb">';

                            for (i=0, l=this.arrayLinks.length; i<l; i++) {

                                linkType = typeof this.arrayLinks[i];

                                switch (linkType) {

                                    case 'string' :

                                        html += '<div class="active section">' + this.arrayLinks[i] + '</div>';

                                        break;

                                    case 'object' :

                                        if(typeof this.arrayLinks[i].href == 'undefined') {
                                            console.warn('Warning on ginoBreadcrumb:  Missing parameter: href ');
                                        } else {
                                            _href = this.arrayLinks[i].href;
                                        }

                                        if (typeof this.arrayLinks[i].title == 'undefined') {
                                            console.warn('Warning on ginoBreadcrumb:  Missing parameter: title ');
                                        } else {
                                            _title = this.arrayLinks[i].title;
                                        }

                                        if(typeof this.arrayLinks[i].label == 'undefined') {
                                            console.warn('Warning on ginoBreadcrumb:  Missing parameter: label ');
                                        } else {
                                            _label = this.arrayLinks[i].label;
                                        }

                                        html += '<a class="section" href="' + _href +
                                        '" title="' + _title +
                                        '">' + _label +
                                        '</a>';

                                        break;
                                }

                                // add spacer
                                if (i+1 < l) {

                                    html += '<i class="right chevron icon divider"></i>';
                                }


                            } // end for

                            html += '</div>';

                            break;

                        case 'BOOTSTRAP':

                            html += '<ol id="ginoBreadcrumb" class="breadcrumb">';

                            for (i=0, l=this.arrayLinks.length; i<l; i++) {

                                linkType = typeof this.arrayLinks[i];

                                switch (linkType) {

                                    case 'string' :

                                        html += '<li class="active">' + this.arrayLinks[i] + '</li>';

                                        break;

                                    case 'object' :

                                        if(typeof this.arrayLinks[i].href == 'undefined') {
                                            console.warn('Warning on ginoBreadcrumb:  Missing parameter: href ');
                                        } else {
                                            _href = this.arrayLinks[i].href;
                                        }

                                        if (typeof this.arrayLinks[i].title == 'undefined') {
                                            console.warn('Warning on ginoBreadcrumb:  Missing parameter: title ');
                                        } else {
                                            _title = this.arrayLinks[i].title;
                                        }

                                        if(typeof this.arrayLinks[i].label == 'undefined') {
                                            console.warn('Warning on ginoBreadcrumb:  Missing parameter: label ');
                                        } else {
                                            _label = this.arrayLinks[i].label;
                                        }

                                        html += '<li><a href="' + _href +
                                        '" title="' + _title +
                                        '">' + _label +
                                        '</a></li>';

                                        break;
                                }

                                // add spacer
                                //if (i+1 < l) {

                                //    html += '<i class="right chevron icon divider"></i>';
                                //}


                            } // end for

                            html += '</ol>';


                            break;
                    }

                    return html;

                } // end render

            }// end object return;

        }, // end breadcrumb

        Grid : function(){

            var _cssEngine =  'SEMANTIC',  // BOOTSTRAP or SEMANTIC
            _id      = '',
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
            _mode    = 'ORM' // SQL or ORM
            _defNull = ''; // default value for null results


            /**
             *
             *
             */
            var _createSqlPagination = function ( mode ){

                var text = '';
                var limit = _limit;
                var page= _page;
                var offset = limit * (page - 1);

                text = " LIMIT " + limit + " OFFSET " + offset;

                return text;

            }

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
            var _createCondition = function ( mode, sql ) {

                var cond = {};
                var sql = sql || '';
                var hasWhere = sql.toUpperCase().search('WHERE') == -1 ? 0 : 1;
                var cond_text = hasWhere ? '' : ' WHERE 1=1 ';
                var i,l, tmp, tmp2;
                tmp = _filterQuery.split(_fQRowSep);

                console.log('query string', tmp);

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


                    switch (mode) {
                        case 'ORM':

                            _fQInternal[tmp2[0]] = tmp2[1];

                            cond[tmp2[0]] = eval("{'like' : tmp2[1]}");

                            break;
                        case 'SQL':

                            // Postgresql conversion required, maybe optional for mysql
                            cond_text += ' AND CAST( ' + tmp2[0] + ' AS text) LIKE \'%' + tmp2[1] + '%\' ';

                            break;
                    }


                }

                console.log('filter', _filter);

                // FILTERS FROM CONFIG
                for ( i=0 , l=_filter.length; i<l; i++ ) {

                    tmp = _filter[i];

                    if ( !ginoU.isSetAndFull(tmp.condition) ) {

                        console.warn('Warning on ginoS:  filter condition not set, assuming AND ');
                        _filter[i].condition = 'AND';
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


                    switch (mode) {

                        case 'ORM':

                            switch(_filter[i].condition) {

                                case 'AND':

                                    // EQUAL
                                    if ( tmp.operator == '=') {
                                        cond[tmp.field] = tmp.value;
                                    // ALL OTHERS OPERATORS
                                    } else {
                                        cond[tmp.field] = eval("{tmp.operator : tmp.value}");
                                    }
                                    break;

                                case 'OR':

                                    // EQUAL
                                    if ( tmp.operator == '=') {
                                        cond.or = eval("{tmp.field: tmp.value}");
                                    // ALL OTHERS OPERATORS
                                    } else {
                                        cond.or = eval("{tmp.field: {tmp.operator : tmp.value}}");
                                    }
                                    break;
                            }

                        break;

                        case 'SQL':

                            cond_text +=    " " + _filter[i].condition +
                                            " " + tmp.field +
                                            " " + tmp.operator +
                                            " '" + tmp.value + "' ";

                        break;
                    }
                }

                console.log('ORM', cond);
                console.log('SQL', cond_text);

                switch (mode) {

                    case 'ORM':
                        return cond;
                    break;

                    case 'SQL':
                        return cond_text;
                    break;
                }

            };


            /**
             * @function createSorting
             * Create sort condition compatible with Waterline ORM
             *
             * @private
             * @return {Object}
             */
            var _createSorting = function ( mode ) {

                var sort = {};
                var sort_text = _order.length > 0 ? ' ORDER BY ' : '';

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

                switch ( mode ) {

                    case "SQL":

                        for( field in sort ) {

                            order = sort[field] == 1 ? 'ASC' : 'DESC';

                            sort_text += field + " " + order + ",";
                        }

                        // remove last comma
                        sort_text = sort_text.slice(0, sort_text.length-1);

                        return sort_text;

                        break;

                    case "ORM":

                        return sort;

                        break;
                }


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

                    default:
                    case 'SEMANTIC':

                        tableClass = 'ui celled striped table';

                        break;
                    case 'BOOTSTRAP':

                        tableClass = 'table table-striped table-bordered table-condensed';

                        break;
                }

                // TABLE
                htmlTable += '<table id="' + _id + '" class="' + tableClass + '">';
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


                htmlTableHead += '  <thead id="' + _id + '_header">';
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
                var htmlTableBody = '',
                    value = '',
                    fieldName = '',
                    tmp = [];

                htmlTableBody += '  <tbody>';

                // filter on required params
                for ( var m=0, n=results.length; m<n; m++ ) {

                    htmlTableBody += "<tr>";

                    for( var i=0, l=_fieldMapping.length; i<l; i++ ) {

                        // reset value
                        value = ''

                        // delete prefix from <prefix>.<field> format to show result data
                        tmp = ginoU.isSet(_fieldMapping[i].field) ? _fieldMapping[i].field.split('.') : [''];
                        fieldName = tmp.length > 1 ? tmp[1] : tmp[0];

                        // render with function
                        // function need following params:
                        // value => value to format
                        // results => data array
                        // m => row counter
                        if (ginoU.isSet(_fieldMapping[i].render)) {

                            // eval is evil...
                            var func = eval('[' + _fieldMapping[i]['render'] + ']')[0];

                            // TODO check input parameters and add warning/errors

                            // for action cell, value is not defined
                            if( !ginoU.isSet(results[m][fieldName]) ) {
                                value = func(null, results, m);
                            } else {
                                value = func(results[m][fieldName], results, m);
                            }

                        // normal render
                        } else {

                            value = results[m][fieldName];
                        }

                        // if value is null show default value
                        value = value == null ? _defNull : value;


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

                var page = _page*1;
                var limit = _limit*1;
                var count = count*1;
                var boxes = (count % limit) > 0 ? parseInt(count / limit) + 1 : parseInt(count / limit);
                var html = '',
                    activeClass = "",
                    recordMsg = '',
                    paginationMsg = '';


                recordMsg = 'Record found: <b>' + count + '</b>';
                paginationMsg = 'Page <b>' + page + '</b> of <b>' + boxes + '</b>';


                switch ( _cssEngine ) {

                    default:
                    case 'SEMANTIC':

                        // only if we have more than one page
                        if(count > limit) {

                            html += '<div>' + recordMsg + ' - ' + paginationMsg + '<br/><br/></div>';

                            html += '<div id="' + _id + '_pagination" class="ui borderless pagination menu">';

                            html += '<a class="item" data-url="' + _url + '" data-page_action="first" >&lt;&lt;</a>';
                            html += '<a class="item" data-url="' + _url + '" data-page_action="less" >&lt;</a>';

                            for (var i=1, l=boxes; i<=l; i++) {

                                activeClass = (i == page) ? ' active ' : '';

                                html += '<a class="item ' + activeClass + '" data-url="' + _url + '" data-page_action="' + i + '" >' + i + '</a>';

                            }

                            html += '<a class="item" data-url="' + _url + '" data-page_action="more" >&gt;</a>';
                            html += '<a class="item" data-url="' + _url + '" data-page_action="last" >&gt;&gt;</a>';

                            html += '</div>';

                        } else {

                            html += '<div>' + recordMsg + '<br/><br/></div>';
                        }

                        break;

                    case 'BOOTSTRAP':

                        // only if we have more than one page
                        if(count > limit) {

                            html += '<div>' + recordMsg + ' - ' + paginationMsg + '<br/><br/></div>';

                            html += '<nav id="' + _id + '_pagination">';
                            html += '<ul class="pagination">';

                            html += '<li><a data-url="' + _url + '" data-page_action="first" aria-label="First" >&lt;&lt;</a></li>';
                            html += '<li><a data-url="' + _url + '" data-page_action="less" aria-label="Previous" >&lt;</a></li>';

                            for (var i=1, l=boxes; i<=l; i++) {

                                activeClass = (i == page) ? ' active ' : '';

                                html += '<li><a class="' + activeClass + '" data-url="' + _url + '" data-page_action="' + i + '" >' + i + '</a></li>';

                            }

                            html += '<li><a data-url="' + _url + '" data-page_action="more" aria-label="Next" >&gt;</a></li>';
                            html += '<li><a data-url="' + _url + '" data-page_action="last" aria-label="Last" >&gt;&gt;</a></li>';

                            html += '</ul>';
                            html += '</nav>';

                        } else {

                            html += '<div>' + recordMsg + '<br/><br/></div>';

                        }

                        break;
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

                var html = '',
                    fieldClass = '',
                    filterValue = '',
                    inputClass = '';

                // filter on required params
                for( var i=0, l=_fieldMapping.length; i<l; i++ ) {

                    filterValue = '';

                    switch ( _cssEngine ) {
                        case 'SEMANTIC':

                            fieldClass = 'two wide ui mini input';
                            break;

                        case 'BOOTSTRAP':

                            fieldClass = 'form-group';
                            inputClass = 'form-control input-sm'
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
                            ' class="' + inputClass + '"' +
                            ' id="' + _id + '_filter_' + _fieldMapping[i].field + '"' +
                            ' name="' + _id + 'Filter_' + _fieldMapping[i].field + '"' +
                            ' value="' + filterValue + '"' +
                            ' style="width:100%">' +
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

                /**
                 * @function init
                 * init function
                 *
                 * @public
                 * @param {Object} params - Object containing configuration params:
                 *                          - id            {String} - grid ID
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

                    _id     = params.id;
                    _url    = params.url;
                    _model  = eval(params.model);
                    _sql    = params.sql || _sql;
                    _page   = params.page || _page;
                    _limit  = params.limit || _limit;
                    _order  = params.order || _order;
                    _filter = params.filter || _filter;
                    _enableFilter   = ginoU.stringToBool(params.enableFilter) || _enableFilter;
                    _enableSort     = ginoU.stringToBool(params.enableSort) || _enableSort;
                    _fieldMapping   = params.fieldMapping || _fieldMapping;
                    _filterQuery    = params.filterQuery || _filterQuery;
                    _cssEngine      = params.cssEngine || _cssEngine;
                    _mode = _sql.trim() != '' ? 'SQL' : 'ORM';
                    _defNull = params.defNull || _defNull;

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
                    var mode = _mode;
                    var sql = _sql;
                    var where = _createCondition( mode, sql );
                    var sort = _createSorting( mode );
                    var page = _page;
                    var limit = _limit;
                    var pagination = _createSqlPagination( mode );
                    var that = this;
                    var counterSql;


                    switch ( mode ) {
                        case 'SQL':

                            counterSql = "SELECT COUNT(1) FROM (" + sql + where + ") as tab";

                            console.log(counterSql);

                            Model.query(counterSql, [], function(err, results){

                                if (err) console.error(err);

                                // POSTGRE results.rows VS MYSQL results
                                count = ginoU.isSet(results.rows) ? results.rows[0].count : results[0].count;

                                sql = sql + where + sort + pagination;

                                console.log(sql);

                                Model.query(sql, [], function(err, results){

                                    if (err) console.error(err);

                                    // POSTGRE results.rows VS MYSQL results
                                    results = !ginoU.isSet(results) ? [] : results;
                                    results = ginoU.isSet(results.rows) ? results.rows : results;

                                    callback(null, _parse( count, results ) );

                                });

                            });

                            break;
                        case 'ORM':

                            Model.count({
                                where   : where
                            }).exec(function (err, counter){

                                if (err) console.error(err);

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

                                    if (err) console.error(err);

                                    // TODO
                                    //if (err) return res.serverError(err);

                                    // create table
                                    callback(null, _parse( count, results ) );

                                });

                            });


                        break;
                    }

                },


            };


        }, // end grid

    } // end object

}();
