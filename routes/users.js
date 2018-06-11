'use strict';

const express = require('express');
const mongoose = require('mongoose');

const User = require('../models/user');

const router = express.Router();


/* ========== POST/CREATE USER ========== */
router.post('/', (req,res,next) => {
  const { fullname, username, password } = req.body;

  return User.find( { username })
    .count()
    .then(count => {
      if (count > 0) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        });
      }
      return User.create( { fullname, username, password } );
    })
    .then(user => {
      return res.location(`api/users/${user.id}`).status(201).json(user);
    })
    .catch( err => {
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      next(err);
    });

});

module.exports = router;