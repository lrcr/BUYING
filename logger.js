// logger.js
var winston = require('winston');
var moment = require('moment');
var daily_file = require('winston-daily-rotate-file');

var daily_opts = {
	level: 'debug',
	filename: __dirname+'/log/app-debug',
	maxsize: 10 * 1024 * 1024,
	datePattern: '.yyyy-MM-dd.log',
	timestamp: function() { return moment().format('YYYY-MM-DD HH:mm:ss'); }
};

var options = {
	level: 'info',
	transports: [
		new (winston.transports.Console)({level:'verbose', colorize: 'all'}),
		// new (winston.transports.File)({filename: 'somefile.log'}),
		new (daily_file)(daily_opts)
	]
};

var logger = new winston.Logger(options);

module.exports = logger
