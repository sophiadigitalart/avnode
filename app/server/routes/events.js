var config = require('getconfig');
var Event = require('../models/event');
var _ = require('lodash');

exports.get = function get(req, res) {
	var params = _.filter(req.params, function(v, k) {
		return (k === 'filter' || k === 'page' || k === 'sorting');
	});
	var section = 'events';
	var page = req.params.page || 1;
	var skip = (page - 1) * config.sections[section].limit;
	var filter = req.params.filter || config.sections[section].categories[0];
	var query = config.sections[section].searchQ[filter];
	var sorting = req.params.sorting || config.sections[section].orders[0];

	// FIXME:
	var path = '/' + section + '/' + _.map(req.params, function(p) { return p; }).join('/') + '/';
	path = path.replace('//', '/');

	// TODO: Validate that the params above are configured in `config`, if not
	// => 404 or 500…
	//

	Event.count(query, function(error, total) {
		Event.find(query)
		.limit(config.sections[section].limit)
		.skip(skip)
		.sort(config.sections[section].sortQ[sorting])
		.exec(function(error, events) {
			res.render('list', {
				title: config.sections[section].title,
				sez: section,
				tot: total,
				path: path,
				sort: sorting,
				filter: filter,
				skip: skip,
				result: events,
				user: req.user
			});
		});
	});
};
