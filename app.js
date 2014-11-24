/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This is the startup script for API and frontend pages.
 *
 * @version 1.0
 * @author Sky_
 */
"use strict";

var express = require('express');
var path = require('path');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var http = require('http');
var _ = require('underscore');
var winston = require('winston');
var routes = require("./api/routes");
var compression = require('compression');
var app = express();

app.set('port', process.env.PORT || 5000);

app.use(compression({
  threshold: 512
}));
app.use(express.logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());

app.set('views', path.join(__dirname, '/public/views'));
app.engine('html', ejs.renderFile);

app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);


// Load Mock API routes
// @todo Comment out when real API is hooked up.
_.each(_.keys(routes), function (route) {
    var value = routes[route],
        httpMethod = route.split(' ').shift().toLowerCase(),
        url = route.split(' ').pop(),
        action = value.action || value,
        controllerName = action.split('#').shift(),
        controllerMethod = action.split('#').pop(),
        controller = require('./api/controllers/' + controllerName);
    app[httpMethod](url, function (req, res, next) {
        setTimeout(function () {
            controller[controllerMethod](req, res, next);
        }, process.env.FAKE_TIMEOUT || 500);
    });
});

app.all("/api/*", function (req, res) {
    res.send("Not found", 404);
});

// Get all the public directories.
var fs = require('fs');
var dirs = fs.readdirSync(path.join(__dirname, 'public'));

//redirect all other routes to angular
app.get("*", function (req, res) {

  /**
   * We check to see if the url matches one of our internal urls
   * if it does, that means that it has not matched, so we return a
   * 404 here.  This allows us to return 404 and debug easier than
   * returning the original html and 200.
   */
  var url = req.originalUrl || req.url;
  _.any(dirs, function(dir) {
    if (url.match('^/' + dir)) {
      res.status(404).send('Not found');
    }
  });

  // If not allow url to pass through and return the bootstrap html.
  res.render("index.html");
});

//start the app
http.createServer(app).listen(app.get('port'), function () {
    winston.info('Express server listening on port ' + app.get('port'));
});