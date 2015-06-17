var fs = require('fs');
var Path = require('path');
var level = require('level');
var db = level('./mydb');

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: {
      view: 'home'
    }
  },
  {
    method: 'GET',
    path: '/static/{path*}',
    handler:  {
      directory: {
        path: './'
      }
    }
  },
  {
    method: "GET",
    path: '/{name}',
    handler: function (request, reply) {
                                                                                // console.log("We got a request!");
        request.log('a giraffe' );
        reply('Hello, ' + encodeURIComponent(request.params.name) + '!');
                                                                                //console.log("frog");
    }
  },
  {
    // would post to db
    method: 'POST',
    path: '/analytics',
    handler: function (request, reply) {
        console.log("should push to database");
        // console.log(request.payload.events.request[0])
        db.put(request.payload.events.request[0].timestamp, request.payload.events.request[0].id, function (err) {
          if (err){
            console.log('Ooops!', err);
          }
          // do something here, like send it back to the browser
        });

    }
  },
  {
        // would read from db
    method: 'GET',
    path: '/analytics',
    handler: function (request, reply) {
        var result = [];
        db.createReadStream()
        .on('data', function (data) {
          result.push(data.key + ' = ' + data.value + "<br/>");
        })
        .on('end', function () {
          console.log(result);
          reply(result.length);
          // reply("a chikoo");
        });
        //
        // db.forEach(function(e){
        //                                                                         // console.log(e);
        //     for (var key in e){
        //         result += key + " " + e[key] + "\n";
        //     }
        // });
        // reply(result);
        // console.log("not broken, just doesn't work");
    }
  },
  {
      method: 'GET',
      path: '/login/{name}',
      handler: function (request, reply) {
                                                                                  // console.log("login/{name}");
          request.log();
          reply("welcome, " + request.params.name);
      }
  }
];
