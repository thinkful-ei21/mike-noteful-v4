'use strict';

const express = require('express');

const passport = require('passport');
const localStrategy = require('../passport/local');

const { JWT_SECRET, JWT_EXPIRY } = require('../config');

const jwt = require('jsonwebtoken');

const router = express.Router();

/**
 * Note: the following example uses failWithError: true which is unique to the Noteful app. The failWithError option configures the middleware to throw an error instead of automatically returning a 401 response. The error is then caught by the error handling middleware on server.js and returned as JSON.
 */
const options = { session: false, failWithError: true };

const localAuth = passport.authenticate('local', options);
const jwtAuth = passport.authenticate('jwt', { session: false, failWithError: true });


// Configure Passport to utilize the strategy
passport.use(localStrategy);


// Accept a user object and call jwt.sign() to generate a JWT
function createAuthToken (user) {
  return jwt.sign({ user }, JWT_SECRET, {
    subject: user.username,
    expiresIn: JWT_EXPIRY
  });
}


/* ========== POST/USER LOGIN AUTHENTICATION USING JWT========== */
router.post('/login', localAuth, (req,res) => {
  const authToken = createAuthToken(req.user);
  res.json({ authToken });
});


/* ========== POST/REFRESH/USER LOGIN AUTHENTICATION ========== */
router.post('/refresh', jwtAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.json({ authToken });
});

module.exports = router;