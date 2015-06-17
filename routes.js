var fs = require('fs');
var Path = require('path');
var level = require('level');
var db = level('./mydb');
var handlers = require('./handlers.js')();

module.exports = [
  { //home page
    method: 'GET',
    path: '/',
    config: {
      auth: {
        mode: "try",
      }
    },
    handler: handlers.displayHome
  },
  { //handler for all css, images and js files
    method: 'GET',
    path: '/static/{path*}',
    handler:  {
      directory: {
        path: './'
      }
    }
  },
  {
    method: 'GET',
    path: '/my-account',
    config: {
        auth: {
          strategy: 'session',
          mode: 'required',
        },
        handler: {
          view: 'profile'
        }
      }
  },
  {
    method: ['GET', 'POST'],
    path: '/login',
    config: {
        auth: 'github',
        handler: handlers.loginUser
      }
  },
  {
    method: 'GET',
    path: '/logout',
    config: {
        handler: handlers.logoutUser
      }
  },
  // {
  //   // would post to db
  //   method: "GET",
  //   path: '/{name}',
  //   handler: function (request, reply) {
  //       request.log('analytics request is being sent');
  //       // reply('Hello, ' + encodeURIComponent(request.params.name) + '!');
  //   }
  // },
  {
    method: 'POST',
    path: '/analytics',
    handler: function (request, reply) {
        db.put(request.payload.events.request[0].timestamp, request.payload.events.request[0].id, function (err) {
          if (err){
            console.log('Ooops!', err);
          }
        });

    }
  },
  {
    method: 'GET',
    path: '/analytics',
    config: {
      auth: {
        mode: "try"
      }
    },
    handler: function (request, reply) {
        var result = [];
        // var today = (results for /timestamp id - 86400000 (24 hours in milliseconds/.length)
        db.createReadStream()
        .on('data', function (data) {
          result.push(data.key + ' = ' + data.value + "<br/>");
        })
        .on('end', function () {
          reply.view("analytics", {
            total: result.length,
            // daily: result,
          });
          // reply('Total number of visits to the site ' + '<strong>' + result.length + '</strong>' + '<br/>' +
          //       'Total number of visits in the last 24 hours ' + '<strong>' + 'today' + '</strong>' + '<br/>');
        });

    }
  },
];
