const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');



module.exports = function(passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL, // Make sure this is set correctly in .env
        proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user exists with this googleId
            let user = await User.findOne({ googleId: profile.id });
            
            if (user) {
                // Update tokens
                user.googleAccessToken = accessToken;
                user.googleRefreshToken = refreshToken;
                user.googleTokenExpires = new Date(Date.now() + 3600000); // 1 hour
                await user.save();
                return done(null, user);
            }
            
            // Check if user exists with this email
            user = await User.findOne({ email: profile.emails[0].value });
            
            if (user) {
                // Link Google account to existing user
                user.googleId = profile.id;
                user.authProvider = 'google';
                user.googleAccessToken = accessToken;
                user.googleRefreshToken = refreshToken;
                user.googleTokenExpires = new Date(Date.now() + 3600000);
                user.emailVerified = true;
                await user.save();
                return done(null, user);
            }
            
            // Create new user
            const newUser = new User({
                googleId: profile.id,
                authProvider: 'google',
                email: profile.emails[0].value,
                username: profile.emails[0].value.split('@')[0] + '_' + Math.floor(Math.random() * 1000), 
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                displayName: profile.displayName,
                avatar: profile.photos[0]?.value,
                emailVerified: true,
                googleAccessToken: accessToken,
                googleRefreshToken: refreshToken,
                googleTokenExpires: new Date(Date.now() + 3600000)
            });
            
            await newUser.save();
            done(null, newUser);
        } catch (error) {
            console.error('Google OAuth error:', error);
            done(error, null);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};
