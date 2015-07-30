var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');
// var Users = require('../app/collections/users');
// var Links = require('../app/collections/links');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

 exports.fetchLinks = function(req, res) {
  Link.find(function(err, links){
    if (err) return handleError(err);
    res.send(200, links);
  })
 };

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Link.findOne({ 'url': uri }, function (err, link) {
    if (err) return handleError(err);
    if(link){
      res.send(200, link);
    }else{
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin,
          visits: 0
        });

        link.save(function(err, newLink) {
          if (err) return console.error(err);
          res.send(200, newLink);
        });
      });
    }
    console.log('FOUND LINK:', link); // Space Ghost is a talk show host.
  })
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username }, function(err, user) {
      if (err) return handleError(err);
      if (!user) {
        res.redirect('/login');
      } else {
        user.comparePassword(password, function(match) {
          if (match) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/login');
          }
        })
      }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

   User.findOne({ username: username }, function(err, user) {
      if (err) return handleError(err);
      if (!user) {
        var newUser = new User({
          username: username,
          password: password
        });
        newUser.save(function(err, newUser) {
          if (err) return handleError(err);
            util.createSession(req, res, newUser);
            // Users.add(newUser);
          });
      } else {
        console.log('Account already exists');
        res.redirect('/signup');
      }
    })
};

exports.navToLink = function(req, res) {
  console.log('--------> ',req.params[0]);
  Link.findOne({ code: req.params[0] }, function(err, link) {
    if (err) return handleError(err);
       if (!link) {
          console.log('FOUND LINK HERE:', link);
          // res.send(200, link);

      res.redirect('/');
    } else {
          console.log('###########', link)
      Link.findOneAndUpdate({ code: req.params[0] }, { visits: link.visits + 1 }, function() {
          return res.redirect(link.url);
        });
    }
  });
};