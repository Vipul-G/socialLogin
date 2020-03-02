const express = require('express');
const passport = require('passport');
const auth = express.Router();
const User = require('../user.model');
let browserName = null;
let clientip = null;
let longitude = null;
let latitude = null;

auth.get('', (req, res) => {
  console.log('Get Api hit');
  browserName = req.headers.browsername;
  clientip = req.headers.clientip;
  longitude = req.headers.longitude;
  latitude = req.headers.latitude
  if (browserName && clientip) {
    module.exports.browserName = browserName;
    module.exports.clientip = clientip;
    module.exports.longitude = longitude;
    module.exports.latitude = latitude;
    res.status(200).json({success: true});
  } else {
    res.status(400).json({success: false});
  }
});

auth.post('/facebook', (req, res, next) => {
  const fbUser = req.body;
  //console.log('fbUser - ', fbUser);
  browserName = fbUser.browserName;
  clientip = fbUser.clientIp;
  longitude = fbUser.longitude;
  latitude = fbUser.latitude;
  // console.log('req.headers --> ', req.headers);
  if (browserName && clientip) {
    User.find({googleId: fbUser.email})
    .then((user) => {
      if (Object.keys(user).length) {
        const modifiedUser = new User({
          name: user.name,
          googleId: user.googleId,
          facebookId: fbUser.email,
          timeOfLogin: user.timeOfLogin,
          browser: user.browser,
          geolocation: user.geolocation,
          userIp: user.userIp
        });
        User.updateOne({googleId: fbUser.email}, modifiedUser)
        .then((res) => {console.log('user updated')})
        .catch(console.log);
      } else {
        const newUser = new User({
          name: fbUser.name,
          googleId: null,
          facebookId: fbUser.email,
          timeOfLogin: Date.now(),
          browser: browserName,
          geolocation: {latitude, longitude},
          userIp: clientip
        });
        newUser.save()
        .then((res) => {'new fb user created', res})
        .catch(console.log);
      }
    })
    .catch(console.log);
  } else {
    res.status(400).json({success: false});
  }
});

auth.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

auth.get('/google/redirect',  passport.authenticate('google'), (req, res) => {
    console.log('Redirect Api hit', req.user);
});

module.exports = {auth};
