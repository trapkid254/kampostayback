'use strict';

/**
 * Basic Unit Tests for Authentication Endpoints
 * 
 * To run these tests:
 * 1. Install Jest: npm install --save-dev jest @types/jest supertest
 * 2. Add test script to package.json: "test": "jest"
 * 3. Set up test database in .env.test
 * 4. Run: npm test
 */

const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const mongoose = require('mongoose');

describe('Authentication Endpoints', () => {
  let server;
  let testUser;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/kampostay_test');
    server = app.listen(0); // Use random available port
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
    server.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    testUser = {
      email: 'test@example.com',
      password: 'Test@123456',
      firstName: 'Test',
      lastName: 'User',
      role: 'student',
    };
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should not register user with invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...testUser, email: 'invalid-email' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not register user with weak password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...testUser, password: 'weak' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should not register duplicate email', async () => {
      await User.create(testUser);
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await User.create(testUser);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should not login with invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'wrong@example.com',
          password: testUser.password,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should not login with invalid password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      // First register and login to get tokens
      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);

      const { refreshToken } = registerResponse.body.data;

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should not refresh with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
