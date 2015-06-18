var aws = require('aws-sdk');
var redis = require('./redisAdaptor.js')({connection: require('redis')});

function handlers() {
  return {

    displayHome: function(request, reply) {
      if (request.auth.isAuthenticated) {
        request.log('analytics request is being sent');
        console.log(request.auth.credentials);
        reply.view('home', {
          name: request.auth.credentials.name.first
        });
      }
      else {
        request.log('analytics request is being sent');
        reply.view('home', {
        name: 'stranger!'
      });
     }
    },

    getProfilepage: function(request, reply) {
      request.log('analytics request is being sent');
      if(request.auth.isAuthenticated) {
        reply.view('profile');
      }
      else {
        reply.redirect("/").code(401);
      }
    },

    loginUser: function(request, reply) {
      request.log('analytics request is being sent');
      if(request.auth.isAuthenticated) {
        request.auth.session.set(request.auth.credentials.profile);
        reply.redirect('/');
      } else
      {
        reply.redirect("/").code(401);
      }

    },

    logoutUser: function(request,reply) {
      request.log('analytics request is being sent');
      request.auth.session.clear();
      reply.redirect('/');
    },

    awsS3: function(request, reply) {
      aws.config.update({accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY});
      var s3 = new aws.S3();
      var s3_params = {
        Bucket: process.env.S3_BUCKET,
        Key: 'images/' + request.query.file_name,
        ContentType: request.query.file_type,
        ACL: 'public-read'
      };
      s3.getSignedUrl('putObject', s3_params, function(err, data){
        if(err){
          console.log("err",err);
        } else {
          var imageData = {
            time: new Date().getTime(),
            id: request.query.file_name,
            username: "anonymous",
            imgURL: "https://s3-eu-west-1.amazonaws.com/dark-image-bucket/" + s3_params.Key
          };
          redis.create(imageData, function(err) {
            if (err)
              {console.log(err);}
            else {
              console.log("added to redis");
          }
          });
          reply(data);
        }
      });
    },

    loadImages: function(request, reply) {
      redis.read(function(data){
        console.log("replying with files");
        reply(JSON.stringify(data));
      });
    },

    //Analytics Handlers

    analyticsPost: function (request, reply) {
      var analObj = {
        time: request.payload.events.request[0].timestamp,
        id: request.payload.events.request[0].id
      };

      redis.addAnalytics(analObj, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("added analytics to redis");
        }
      });

      reply(true);
      // db.put(request.payload.events.request[0].timestamp, request.payload.events.request[0].id, function (err) {
      //   if (err){
      //     console.log('Ooops!', err);
      //   }
      // });
    },

    analyticsGet: function (request, reply) {
      var result = [];

      redis.readAnalytics(function(data){
        reply.view("analytics", {total: data.length});
      });

      // var today = (results for /timestamp id - 86400000 (24 hours in milliseconds/.length)
      // db.createReadStream()
      // .on('data', function (data) {
      //   result.push(data.key + ' = ' + data.value + "<br/>");
      // })
      // .on('end', function () {
      //   reply.view("analytics", {
      //     total: result.length
      //   });
      // reply('Total number of visits to the site ' + '<strong>' + result.length + '</strong>' + '<br/>' +
      //       'Total number of visits in the last 24 hours ' + '<strong>' + 'today' + '</strong>' + '<br/>');
    }

  };
}

module.exports = handlers;
