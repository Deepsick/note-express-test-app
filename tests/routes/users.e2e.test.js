const request = require('supertest');

const app = require('../../server');
const { ApiRoute, HttpStatus } = require('../../const');
const db = require('../../config/db');
const cache = require('../../config/redis');

let authInfo;
let authInvalidInfo;
let authWrongInfo;
beforeAll(async () => {
  authInfo = {
    login: 'username',
    password: 'password1',
    secondPassword: 'password1',
  };
  authInvalidInfo = {
    login: 'username123',
    password: '11',
    secondPassword: 'password12',
  };
  authWrongInfo = {
    login: 'username11',
    password: 'password11',
    secondPassword: 'password12',
  };

  await db.authenticate();
  await db.drop();
  await db.sync({ force: true });
  await cache.drop();
}, 15000);

afterAll(async () => {
  await db.close();
  await cache.close();
}, 15000);

describe('Test Users routes', () => {
  describe('POST /auth', () => {
    test('Should successfully create user', async () => {
      const res = await request(app)
        .post(`${ApiRoute.USERS}/auth`)
        .send({
          login: 'newUser',
          password: '123456',
          secondPassword: '123456',
        });

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body.login).toBe('newUser');
      expect(typeof res.body.token).toBe('string');
      expect(res.body.token.length).not.toBe(0);
    });

    test('Should return message on validation error', async () => {
      const res = await request(app)
        .post(`${ApiRoute.USERS}/auth`)
        .send(authWrongInfo);

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(res.body.message).toBe('Passwords should match');
    });

    test('Should return unauthorized error', async () => {
      await request(app)
        .post(`${ApiRoute.USERS}/auth`)
        .send(authInfo);
      const res = await request(app)
        .post(`${ApiRoute.USERS}/auth`)
        .send(authInfo);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(res.body.message).toBe('User is already exist');
    });
  });

  describe('POST /login', () => {
    test('Should successfully login user', async () => {
      await request(app)
        .post(`${ApiRoute.USERS}/auth`)
        .send(authInfo);

      const res = await request(app)
        .post(`${ApiRoute.USERS}/login`)
        .send(authInfo);

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body.login).toBe(authInfo.login);
      expect(typeof res.body.token).toBe('string');
      expect(res.body.token.length).not.toBe(0);
    });

    test('Should return message on validation error', async () => {
      const res = await request(app)
        .post(`${ApiRoute.USERS}/login`)
        .send(authInvalidInfo);

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test('Should return unauthorized error', async () => {
      const res = await request(app)
        .post(`${ApiRoute.USERS}/login`)
        .send({
          login: 'someRandomName',
          password: '12345678',
        });

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(res.body.message).toBe('Wrong credentials');
    });
  });

  describe('POST /logout', () => {
    test('Should successfully logout user', async () => {
      await request(app)
        .post(`${ApiRoute.USERS}/auth`)
        .send(authInfo);

      const { body } = await request(app)
        .post(`${ApiRoute.USERS}/login`)
        .send(authInfo);

      const res = await request(app)
        .post(`${ApiRoute.USERS}/logout`)
        .set('Authorization', `Bearer ${body.token}`);

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body.message).toBe('User is logout');
    });

    test('Should return unathorized error', async () => {
      const res = await request(app)
        .post(`${ApiRoute.USERS}/logout`);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(res.body.message).toBe('Unauthorized');
    });
  });
});
