'use strict';

const express = require('express');
const mongoose = require('mongoose');

const User = require('../models/user');

const router = express.Router();


/* ========== POST/CREATE USER ========== */
router.post('/', (req, res, next) => {
  const {
    fullname,
    username,
    password
  } = req.body;

  return User.find({
    username
  })
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
      return User.hashPassword(password)
        .then(digest => {
          const newUser = {
            username,
            password: digest,
            fullname
          };
          return User.create(newUser);
        })
        .then(user => {
          return res.location(`api/users/${user.id}`).status(201).json(user);
        })
        .catch(err => {
          if (err.code === 11000) {
            err = new Error('The username already exists');
            err.status = 400;
          }
          next(err);
        });
    });
});

module.exports = router;