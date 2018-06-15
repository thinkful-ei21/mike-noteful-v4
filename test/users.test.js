'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_MONGODB_URI } = require('../config');

const User = require('../models/user');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Noteful API - Users', function () {
  const username = 'exampleUser';
  const password = 'examplePass';
  const fullname = 'Example User';

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function () {
    return User.createIndexes();
  });

  afterEach(function () {
    return mongoose.connection.db.dropDatabase();
  });

  after(function () {
    return mongoose.disconnect();
  });
  
  describe('/api/users', function () {
    describe('POST', function () {
      it('Should create a new user', function () {
        const testUser = { username, password, fullname };

        let res;
        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(_res => {
            res = _res;
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys('id', 'username', 'fullname');

            expect(res.body.id).to.exist;
            expect(res.body.username).to.equal(testUser.username);
            expect(res.body.fullname).to.equal(testUser.fullname);

            return User.findOne({ username });
          })
          .then(user => {
            expect(user).to.exist;
            expect(user.id).to.equal(res.body.id);
            expect(user.fullname).to.equal(testUser.fullname);
            return user.validatePassword(password);
          })
          .then(isValid => {
            expect(isValid).to.be.true;
          });
      });

      it('Should reject users with missing username', function () {
        const testUser = { password, fullname };
        return chai.request(app).post('/api/users').send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Missing \'username\' in request body');
          });
      });

      /**
       * COMPLETE ALL THE FOLLOWING TESTS
       */
      it('Should reject users with missing password', function () {
        const testUser = { username, fullname };
        return chai.request(app).post('/api/users').send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Missing \'password\' in request body');
          });
      });

      it('Should reject users with non-string username', function() {
        const testUsernameString = {username: 2, password};
        return chai.request(app).post('/api/users').send(testUsernameString)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Incorrect field type: expected string');
          });
      });

      it('Should reject users with non-string password', function() {
        const testPasswordString = {username, password: 1};
        return chai.request(app).post('/api/users').send(testPasswordString)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Incorrect field type: expected string');
          });
      });

      it('Should reject users with non-trimmed username', function() {
        const testNonTrimmedUsername = {username: ' my_user', password};
        return chai.request(app).post('/api/users').send(testNonTrimmedUsername)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Cannot start or end with whitespace');
          });
      });

      it('Should reject users with non-trimmed password', function() {
        const testNonTrimmedPassword = {username, password: ' my_password'};
        return chai.request(app).post('/api/users').send(testNonTrimmedPassword)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Cannot start or end with whitespace');
          });
      });

      it('Should reject users with empty username', function() {
        const testEmptyStringUsername = {username: '', password};
        return chai.request(app).post('/api/users').send(testEmptyStringUsername)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Field: \'username\' must be at least 1 characters long');
          });
      });

      it('Should reject users with password less than 8 characters', function() {
        const testShortPassword = { username, password: '1234567'};
        return chai.request(app).post('/api/users').send(testShortPassword)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Field: \'password\' must be at least 8 characters long');
          });
      });

      it('Should reject users with password greater than 72 characters', function() {
        const testLongPassword = { username, 
          password:
          '12345678902234567890323456789042345678905234567890623456789072345678907234' };
        return chai.request(app).post('/api/users').send(testLongPassword)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res.body.message).to.equal('Field: \'password\' must be at most 72 characters long');
          });
      });

      it('Should reject users with duplicate username', function() {
        const testUser = { username: 'my-test-user', password };
        return User.create(testUser)
          .then(()=> 
            chai.request(app).post('/api/users').send(testUser))
          .then(res => {
            expect(res).to.have.status(400);
            expect(res.body.message).to.equal('The username already exists');
          });
      });

      it('Should trim fullname', function() {
        const testNonTrimmedFullname = {username, fullname: ' full-name', password};
        return chai.request(app).post('/api/users').send(testNonTrimmedFullname)
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body.fullname).to.equal('full-name');
          });
      });
    });

  });
});