'use strict';

const bcrypt = require('bcryptjs');
const password = 'password';

/* Hash a password with cost-factor 10, then run compare to verify */
bcrypt.hash(password, 10)
  .then(digest => {
    console.log('digest: ', digest);
    return digest;
  })
  .then(hash =>  bcrypt.compare(password, hash))
  .then(valid => console.log('isValid: ', valid))
  .catch(err => console.log('error', err));
