const request = require('supertest');

const app = require('../../server');
const { ApiRoute, HttpStatus } = require('../../const');
const db = require('../../config/db');
const cache = require('../../config/redis');

let authInfo;
let token;
let noteId;
let publicNoteId;

beforeAll(async () => {
  authInfo = {
    login: 'username',
    password: 'password1',
    secondPassword: 'password1',
  };

  await db.authenticate();
  await db.drop();
  await db.sync({ force: true });
  await cache.drop();
  const res = await request(app)
    .post(`${ApiRoute.USERS}/auth`)
    .send(authInfo);
  token = res.body.token;

  const noteRes = await request(app)
    .post(ApiRoute.NOTES)
    .send({ text: 'Some test note for future tests' })
    .set('Authorization', `Bearer ${token}`);
  const publicNoteRes = await request(app)
    .post(ApiRoute.NOTES)
    .send({ text: 'Brand dnew note for this test' })
    .set('Authorization', `Bearer ${token}`);

  noteId = noteRes.body.id;
  publicNoteId = publicNoteRes.body.id;
}, 15000);

afterAll(async () => {
  await db.close();
  await cache.close();
}, 15000);

describe('Test Notes routes', () => {
  describe('POST /', () => {
    test('Should successfully create note', async () => {
      const res = await request(app)
        .post(ApiRoute.NOTES)
        .send({ text: 'new note is here' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body.text).toBe('new note is here');
    });

    test('Should return message on unauthorized', async () => {
      const res = await request(app)
        .post(`${ApiRoute.NOTES}`)
        .send({ text: 'short' });

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(res.body.message).toBe('Unauthorized');
    });

    test('Should return message on bad request', async () => {
      const res = await request(app)
        .post(`${ApiRoute.NOTES}`)
        .send({ text: '11' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('GET /', () => {
    test('Should successfully get notes', async () => {
      await request(app)
        .post(ApiRoute.NOTES)
        .send({ text: 'new note is here' })
        .set('Authorization', `Bearer ${token}`);

      const res = await request(app)
        .get(ApiRoute.NOTES)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('Should return message on bad request', async () => {
      const res = await request(app)
        .get(`${ApiRoute.NOTES}?offset=100`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test('Should return message on not found', async () => {
      const { body } = await request(app)
        .post(`${ApiRoute.USERS}/auth`)
        .send({
          login: 'qwerty123',
          password: '123456',
          secondPassword: '123456',
        });
      const res = await request(app)
        .get(`${ApiRoute.NOTES}`)
        .set('Authorization', `Bearer ${body.token}`);

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test('Should return message on unauthorized', async () => {
      const res = await request(app)
        .get(`${ApiRoute.NOTES}`);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(res.body.message).toBe('Unauthorized');
    });
  });

  describe('PATCH /{noteId}', () => {
    test('Should successfully update note', async () => {
      const { body } = await request(app)
        .post(ApiRoute.NOTES)
        .send({ text: 'new note is here' })
        .set('Authorization', `Bearer ${token}`);

      const res = await request(app)
        .patch(`${ApiRoute.NOTES}/${body.id}`)
        .send({ text: 'some new text to update' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(HttpStatus.OK);
    });

    test('Should return message on bad request', async () => {
      const res = await request(app)
        .patch(`${ApiRoute.NOTES}/${noteId}`)
        .send({ text: 'short' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test('Should return message on not found', async () => {
      const res = await request(app)
        .patch(`${ApiRoute.NOTES}/99999`)
        .send({ text: 'some new text to update' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    test('Should return message on unauthorized', async () => {
      const res = await request(app)
        .patch(`${ApiRoute.NOTES}/${noteId}`)
        .send({ text: 'some new text to update' });

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(res.body.message).toBe('Unauthorized');
    });
  });

  describe('DELETE /{noteId}', () => {
    test('Should successfully delete note', async () => {
      const res = await request(app)
        .delete(`${ApiRoute.NOTES}/${noteId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(HttpStatus.OK);
      expect(res.body.id).toBe(noteId);
    });

    test('Should return message on bad request', async () => {
      const res = await request(app)
        .delete(`${ApiRoute.NOTES}/bad_id`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });

    test('Should return message on unauthorized', async () => {
      const res = await request(app)
        .delete(`${ApiRoute.NOTES}/${noteId}`);

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(res.body.message).toBe('Unauthorized');
    });

    test('Should return message on not found', async () => {
      const res = await request(app)
        .delete(`${ApiRoute.NOTES}/${13}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(res.body.message).toBe('There is no such note');
    });
  });

  describe('POST /{noteId}/share', () => {
    test('Should successfully share a note', async () => {
      const res = await request(app)
        .post(`${ApiRoute.NOTES}/${publicNoteId}/share`)
        .send({ isPublic: true })
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(HttpStatus.OK);
    });

    test('Should return message on unauthorized', async () => {
      const res = await request(app)
        .post(`${ApiRoute.NOTES}/${noteId}/share`)
        .send({ isPublic: true });

      expect(res.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(res.body.message).toBe('Unauthorized');
    });

    test('Should return message on not found', async () => {
      const res = await request(app)
        .post(`${ApiRoute.NOTES}/999999/share`)
        .send({ isPublic: true })
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(res.body.message).toBe('There is no such note');
    });

    test('Should return message on bad request', async () => {
      const res = await request(app)
        .post(`${ApiRoute.NOTES}/${13}/share`)
        .send({ isPublic: 'hello' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });

  describe('GET /{noteId}/share', () => {
    test('Should successfully share a note', async () => {
      const res = await request(app)
        .get(`${ApiRoute.NOTES}/${publicNoteId}/share`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(HttpStatus.OK);
    });

    test('Should return message on not found', async () => {
      const res = await request(app)
        .get(`${ApiRoute.NOTES}/9999999/share`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(res.body.message).toBe('There is no such note');
    });

    test('Should return message on bad request', async () => {
      const newNoteRes = await request(app)
        .post(ApiRoute.NOTES)
        .send({ text: 'hello one more time' })
        .set('Authorization', `Bearer ${token}`);

      const res = await request(app)
        .get(`${ApiRoute.NOTES}/${newNoteRes.body.id}/share`)
        .send({ isPublic: 'hello' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
    });
  });
});
