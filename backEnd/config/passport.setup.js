const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');


const keys = require('./keys');
const User = require('../user.model');


passport.serializeUser((user, done) => {
    console.log('*passport.serialize', user);
    done(null, user._id); // saving the user session
});

passport.deserializeUser( async (id, done) => {
   console.log('*passport.deserialize', id);
    const user = await userCollection.findOne({'_id' : id});
   done(null, user); // this will attach the user to the request, so we can handle it in the route handler
});

passport.use(new GoogleStrategy({
    clientID: keys.google.clientId,
    clientSecret: keys.google.clientSecret,
    callbackURL: 'http://localhost:3000/auth/google/redirect'
}, async (accessToken,refreshToken,profile,done) => {

    try {
        console.log('*GoogleStretegy called');
        let alreadyExist;
        await User.findOne({googleId: profile._json.email})
        .then((user) => {
            alreadyExist = user;
        })
        .catch((err) => {
            console.log('*Catch error - ', err);
        });

        if(alreadyExist) {
            console.log(`*User ${alreadyExist.name} already exists`);
            done(null, alreadyExist);
        } else {
            console.log('*User not exist already');
            console.log('*profile - ', profile);

            let user;
            if (profile.provider === 'google') {
                console.log('*Provider is google');
                console.log('--------------------------------------------------------');
                const {browserName, clientip, latitude, longitude} = require('../routes/user');
                console.log('*BrowserName - ', browserName);
                user = new User({
                    name: profile.displayName,
                    googleId: profile._json.email,
                    facebookId: null,
                    timeOfLogin: Date.now(),
                    browser: browserName,
                    geolocation: {latitude, longitude},
                    userIp: clientip
                });
            }
            user.save()
            .then((newUser) => {
                console.log('New User Created');
                done(null, newUser);
            })
            .catch((err) => {
                console.log('Error - ', err);
                done(err);
            });
        }
    } catch(error) {
        console.log('Catched error - '. error);
    }

}))
