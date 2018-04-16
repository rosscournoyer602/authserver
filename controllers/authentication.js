const jwt = require('jwt-simple');
const User = require('../models/user');
const config = require('../config');

function tokenForUser(user) {
    const timestamp = new Date().getTime();
    return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

exports.signin = function(req, res, next) {
    //user has had their email and password auth'd
    //we just need to give them a token
    res.send({ token: tokenForUser(req.user) })
}

exports.signup = function(req, res, next) {
    const email = req.body.email;
    const password = req.body.password;

    //make sure request is correctly formatted
    if (!email || !password) return res.status(422).send({ error: 'email or password missing'});

    //check if email already exists
    User.findOne({ email: email}, function(err, existingUser) {
       if (err) return next(err);
       if (existingUser) return res.status(422).send({ error: 'Email is in use'});
    })
    //if not, make a new user from the User model
    const user =  new User({
        email: email,
        password: password
    })
    //add user to database and respond with a token
    user.save(function(err) {
        if (err) return next(err);

        res.json({ token: tokenForUser(user) });
    });
}