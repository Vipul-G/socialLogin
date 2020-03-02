const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {type: String, required: [true, 'name is required'], unique: true},
    googleId: {type: String, unique: true},
    facebookId: {type: String, unique: true},
    timeOfLogin: {type: Date},
    browser: {type: String},
    geolocation: {
      latitude: { type: String},
      longitude: {type: String}
    },
    userIp: {type: String}
});

module.exports = mongoose.model('User', userSchema);
