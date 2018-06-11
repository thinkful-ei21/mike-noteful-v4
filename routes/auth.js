'use strict';

const express = require('express');

const passport = require('passport');
const localStrategy = require('../passport/local');

const router = express.Router();

/**
 * Note: the following example uses failWithError: true which is unique to the Noteful app. The failWithError option configures the middleware to throw an error instead of automatically returning a 401 response. The error is then caught by the error handling middleware on server.js and returned as JSON.
 */
const options = { session: false, failWithError: true };

const localAuth = passport.authenticate('local', options);

// Configure Passport to utilize the strategy
passport.use(localStrategy);

/* ========== POST/USER LOGIN AUTHENTICATION ========== */
router.post('/', localAuth, (req, res) => res.json(req.user));

module.exports = router;