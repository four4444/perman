var main = require('./main.js');
var login = require('./login.js');
var registration = require('./registration.js');
var dashboard = require('./dashboard.js');

module.exports = function(app, passport) {

    app.use('/', main);

    app.use('/login', login);
    
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/dashboard',
        failureRedirect : '/login',
        failureFlash : true
    }));

    app.use('/registration', registration);
    
    app.post('/registration', passport.authenticate('local-signup', {
        successRedirect : '/dashboard',
        failureRedirect : '/registration',
        failureFlash : true
    }));

    app.use('/dashboard', dashboard);

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/login');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}