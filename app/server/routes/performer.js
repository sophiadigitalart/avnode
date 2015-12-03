var DB = require('../modules/db-manager');
var Fnc = require('../modules/general-functions');
var config = require('getconfig');
GLOBAL._config = config;

exports.get = function get(req, res) {
	var pathArray = req.url.split("?")[0].split("/");
	var output = (req.query.output ? req.query.output : false);
	if (pathArray[0]=="") pathArray.shift();
	if (pathArray[pathArray.length-1]=="") pathArray.pop();
	if (pathArray[pathArray.length-1].indexOf("output")!=-1) pathArray.pop();
	var passport_user = req.session.passport && req.session.passport.user ? req.session.passport.user : {};
	if (pathArray.length > 0) {
		DB.users.findOne({permalink:pathArray[0]}, function(e, result) {
			if (result) {
				switch (pathArray.length) {
					case 1 :
						res.render('performer', { userpage:true, title: result.display_name, result : result, Fnc:Fnc, user : passport_user });
						break;
					case 2 :
						if (config.sections[pathArray[1]]) {
							res.render('performer_list', { userpage:true, title: result.display_name, title2: config.sections[pathArray[1]].title, sez:pathArray[1], result : result, Fnc:Fnc, user : passport_user });

						} else {
							res.sendStatus(404);
						}
						break;
					case 3 :
						if (config.sections[pathArray[1]]) {
							DB[config.sections[pathArray[1]].coll].findOne({permalink:pathArray[2]}, function(e, dett) {
								if (dett) {
									if (output=="json") {
										res.send(result);
									} else if (output=="xml") {
										res.render('performer_dett_'+pathArray[1]+"_xml", {	layout: false, userpage:true, title: result.display_name+": "+config.sections[pathArray[1]].title, sez:pathArray[1], result : result, dett : dett, Fnc:Fnc, user : passport_user });
									} else {
										res.render('performer_dett_'+pathArray[1], { userpage:true, title: result.display_name+":  "+config.sections[pathArray[1]].title, sez:pathArray[1], result : result, dett : dett, Fnc:Fnc, user : passport_user });
									}
								} else {
									res.sendStatus(404);
								}
							});
						} else {
							res.sendStatus(404);
						}
						break;
					case 4 :
						if (config.sections[pathArray[1]] && config.sections[pathArray[1]].subsections && config.sections[pathArray[1]].subsections[pathArray[3]]) {
							DB[config.sections[pathArray[1]].coll].findOne({permalink:pathArray[2]}, function(e, dett) {
								if (dett) {
									console.log("GETGETGETGETGETGET");
									console.log(req.session.call);
									if(typeof req.query.step!='undefined'){
										req.session.call = req.query.step;
									}
									if (!req.session.call){
										req.session.call = {
											step: 0,
											event: {
												_id : dett._id,
												permalink: dett.permalink
											},
											//user: req.session.passport.user
										}
									}

									if (output=="json") {
										res.send(result);
									} else if (output=="xml") {
										res.render('performer_dett_'+pathArray[1]+'_'+pathArray[3]+"_xml", {	layout: false, userpage:true, title: result.display_name+": "+config.sections[pathArray[1]].title, sez:pathArray[1], result : result, dett : dett, Fnc:Fnc, user : passport_user, call: req.session.call });
									} else {
										res.render('performer_dett_'+pathArray[1]+'_'+pathArray[3], {                          userpage:true, title: result.display_name+": "+config.sections[pathArray[1]].title, sez:pathArray[1], result : result, dett : dett, Fnc:Fnc, user : passport_user, call: req.session.call });
									}
								} else {
									res.sendStatus(404);
								}
							});
						} else {
							res.sendStatus(404);
						}
						break;
					default :
						res.sendStatus(404);
				}
			} else {
				res.sendStatus(404);
			}
		});
	} else {
		res.sendStatus(404);
	}
};

exports.post = function post(req, res) {
	var pathArray = req.url.split("/");
	var output = (req.query.output ? req.query.output : false);
	if (pathArray[0]=="") pathArray.shift();
	if (pathArray[pathArray.length-1]=="") pathArray.pop();
	if (pathArray[pathArray.length-1].indexOf("output")!=-1) pathArray.pop();
	var passport_user = req.session.passport && req.session.passport.user ? req.session.passport.user : {};
	if (pathArray.length > 0) {
		DB.users.findOne({permalink:pathArray[0]}, function(e, result) {
			if (result) {
				switch (pathArray.length) {
					case 4 :
						if (config.sections[pathArray[1]] && config.sections[pathArray[1]].subsections && config.sections[pathArray[1]].subsections[pathArray[3]]) {
							DB[config.sections[pathArray[1]].coll].findOne({permalink:pathArray[2]}, function(e, dett) {
								console.log("POSTPOSTPOSTPOSTPOST");
								console.log(req.body);
								console.log(req.body.step);
								console.log(typeof req.body.step);
								if (dett && typeof req.body.step!='undefined') {
									var msg;
									switch (parseInt(req.body.step)) {
										case 0 :
											if (dett && typeof req.body.index!='undefined') {
												req.session.call.step = parseInt(req.body.step)+1;
												req.session.call.index = parseInt(req.body.index);
											} else {
												msg = {e:[{name:"index",m:__("Please select a call")}]}
											}
											break;
										case 1 :
											if (dett && req.body.accept=='1') {
												req.session.call.step = parseInt(req.body.step)+1;
											} else {
												msg = {e:[{name:"accept",m:__("Please accept the terms and conditions to go forward")}]}
											}
											break;
										case 2 :
											if (dett && typeof req.body.performance!='undefined') {
												req.session.call.step = parseInt(req.body.step)+1;
												for (var a; a<passport_user.performances.length; a++) {
													if (passport_user.performances[a]._id==req.body.performance){
														req.session.call.performance = passport_user.performances[a];
														console.log("staminchia");
														console.log(req.session.call.performance);
													}
												}

											} else {
												msg = {e:[{name:"accept",m:__("Please select a performance to go forward")}]}
											}
											break;
										case 3 :
											if (dett && req.body.topics.length) {
												req.session.call.step = parseInt(req.body.step)+1;
												req.session.call.topics = req.body.topics;
											} else {
												msg = {e:[{name:"accept",m:__("Please select at least 1 topic to go forward")}]}
											}
											break;
									}
									console.log(req.session.call);
									/*req.session.call = {
										step: 0,
										event: {
											_id : dett._id,
											permalink: dett.permalink
										}
									}*/
									if (output=="json") {
										res.send(result);
									} else if (output=="xml") {
										res.render('performer_dett_'+pathArray[1]+'_'+pathArray[3]+"_xml", {	layout: false, userpage:true, title: result.display_name+": "+config.sections[pathArray[1]].title, sez:pathArray[1], result : result, dett : dett, Fnc:Fnc, user : passport_user, call: req.session.call, msg:msg });
									} else {
										res.render('performer_dett_'+pathArray[1]+'_'+pathArray[3], {                          userpage:true, title: result.display_name+": "+config.sections[pathArray[1]].title, sez:pathArray[1], result : result, dett : dett, Fnc:Fnc, user : passport_user, call: req.session.call, msg:msg });
									}
								} else {
									res.sendStatus(404);
								}
							});
						} else {
							res.sendStatus(404);
						}
						break;

					default :
						res.sendStatus(404);
				}
			} else {
				res.sendStatus(404);
			}
		});
	} else {
		res.sendStatus(404);
	}
};

