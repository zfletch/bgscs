(function() {
  'use strict';

  var https = require('https');
  var jsdom = require('jsdom');
  var jquery = require('jquery');
  var fs = require('fs');
  var path = require('path');

  function printUsageInformation(code) {
    console.log('node bgscs.js [-h] [-f FILENAME]');
    process.exit(code);
  }

  var options = {};

  (function() {
    var filename, arg, ii;

    for (ii = 2; ii < process.argv.length; ii++) {
      arg = process.argv[ii];

      if (arg === '-h') {
        printUsageInformation(0);
      } else if (arg == '-f') {
        filename = process.argv[++ii];

        if (filename === undefined) {
          printUsageInformation(1);
        } else {
          options.filename = filename;
        }
      } else {
        printUsageInformation(1);
      }
    }
  })();

  function getCrosswordFromFile(relativePath, callback) {
    var filePath = path.join(__dirname, relativePath);

    fs.readFile(filePath, { encoding: 'utf-8' }, function(error, data) {
      if (error) {
        callback({ error: true, text: error });
      } else {
        callback({ error: false, body: data });
      }
    });
  }

  function getCrosswordFromWeb(callback) {
    var options = {
      host: 'www.bostonglobe.com',
      port: 443,
      path: '/lifestyle/crossword',
      method: 'GET'
    };

    var req = https.request(options, function(response) {
      var body = '';

      if (response.statusCode === 200) {
        response.setEncoding('utf8');
        response.on('data', function(chunk) {
          body += chunk;
        });

        response.on('end', function() {
          callback({ error: false, body: body });
        });
      } else {
        callback({ error: true, text: 'HTTP status code ' + response.statusCode });
      }
    });
    req.end();

    req.on('error', function(error) {
      callback({ error: true, text: error });
    });
  }

  function processHTML(response, callback) {
    var window, $;

    if (response.error) {
      console.log('Error ' + response.text);
    } else {
      window = jsdom.jsdom(response.body, {}).defaultView;
      callback(jquery(window));
    }
  }

  function processCrossword($) {
    $('#puzzle tr').each(function() {
      var $tr = $(this);
      var arr = [];

      $tr.find('td').each(function() {
        var $td = $(this);
        var $input = $td.find('input');

        if ($td.hasClass('deadCell')) {
          arr.push('*');
        } else {
          arr.push($input.attr('name'));
        }
      });

      console.log(arr.join(' '));
    });

    process.exit();
  }

  (function() {
    var callback = function(response) { processHTML(response, processCrossword); };
    var filename = options.filename;

    if (filename === undefined) {
      getCrosswordFromWeb(callback);
    } else {
      getCrosswordFromFile(filename, callback);
    }
  })();
})();
