const express = require('express');
const {check, body} = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/user');
const router = express.Router();

router.get('/login', authController.getLogin);
router.get('/signup', authController.getSignup);
router.get('/reset', authController.getReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/reset', authController.postReset);
router.post('/login', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .normalizeEmail(),
    body('password', "Password must be valid")
        .isLength({min: 5})
        .trim()
],
authController.postLogin);
router.post('/signup', [
    check('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, {req}) => {
            return User.findOne({email: value})
            .then(userDoc => {
                if (userDoc) {
                    return Promise.reject('Email already in use.');
                }
            })
        })
        .normalizeEmail(),
    body('password', 'Password must be at least 5 characters long.')
        .isLength({min: 5})
        .trim(),
    body('confirmPassword')
        .trim()
        .custom((value, {req}) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match.');
        }
        return true;
    })
], authController.postSignup);
router.post('/logout', authController.postLogout);

module.exports = router;