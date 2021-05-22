const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendGridTransport({
    auth: {
        api_key: "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"
    }
}));

exports.getLogin = (req, res, next) => {
    // console.log(req.get('Cookie').split('=')[1]);
    // const isLoggedIn = req.get('Cookie').split('=')[1].trim() == 'true';
    // console.log(isLoggedIn);
    console.log(req.session.isLoggedIn);
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message
        // isAuthenticated: false
    });
};

exports.getSignup = (req, res, next) => {
    // console.log(req.get('Cookie').split('=')[1]);
    // const isLoggedIn = req.get('Cookie').split('=')[1].trim() == 'true';
    // console.log(isLoggedIn);
    // console.log(req.session.isLoggedIn);
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message
        // isAuthenticated: false
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email: email})
    .then(user => {
        if (!user) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/login');
        }
        bcrypt
            .compare(password, user.password)
            .then(valid => {
                if (valid) {
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                    return req.session.save(err => {
                        console.log(err);
                        res.redirect('/');
                    }); // Makes sure the session was created before redirecting
                }
                req.flash('error', 'Invalid email or password.');
                res.redirect('/login');
            })
            .catch(err => {
                console.log(err);
                res.redirect('/login');
            })
    })
    // .then(user => {

    //     res.redirect('/');
    // })
    .catch(err => console.log(err));
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword; 

    User.findOne({email: email})
        .then(userDoc => {
            if (userDoc) {
                req.flash('error', 'Email already in use.');
                return res.redirect('/signup');
            }
            return bcrypt
                .hash(password, 12)
                .then(hashedPassword => {
                    const user = new User({
                        email: email,
                        password: hashedPassword,
                        cart: { items: [] }
                    });
                    return user.save();
                });
        })
        .then(result => {
            res.redirect('/login');
            transporter.sendMail({
                to: email,
                from: "shop@node-complete.com",
                subject: 'Account Successfully Created.',
                html: '<h1>You successfully signed up!</h1>'
            }).catch(err => {
                console.log(err);
            });
            
        })
        .catch(err => {
            console.log(err);
        });

};

exports.postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect('/');
    }) 
};