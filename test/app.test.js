require('dotenv').config();

const request = require('supertest');
const app = require('../lib/app');
const client = require('../lib/utils/client');
const child_process = require('child_process');

describe('app routes', () => {

  beforeEach(() => {
    child_process.execSync('npm run recreate-tables');
  });

  afterAll(() => {
    client.end();
  });

  const testNote = note => {
    expect(note).toEqual({
      id: expect.any(Number),
      title: 'My Title',
      body: 'This is a great note',
      author: 'marty',
      isPublished: false,
      created: expect.any(String)
    });
  };

  const TEST_NOTE = {
    title: 'My Title',
    author: 'marty',
    body: 'This is a great note'
  };
  
  const createNote = (note = TEST_NOTE) => request(app)
    .post('/api/v1/notes')
    .expect(200)
    .send(note);
  
  it('creates a note', () => {
    return createNote()
      .then(({ body }) => {
        testNote(body);
      });
  });
  
  it('gets a list of notes', () => {
    return Promise.all([
      createNote({ title: 'note 1', author: 'marty', body: 'body1' }),
      createNote({ title: 'note 2', author: 'marty', body: 'body2' }),
      createNote({ title: 'note 3', author: 'marty', body: 'body3' })
    ])
      .then(() => {
        return request(app).get('/api/v1/notes')
          .expect(200)
          .then(({ body }) => {
            expect(body.length).toBe(3);
          });
      });
  });

  it('gets a note by id', () => {
    return createNote()
      .then(({ body }) => {
        return request(app)
          .get(`/api/v1/notes/${body.id}`)
          .expect(200);
      })
      .then(({ body }) => {
        testNote(body);
      });
  });

  it('updates a note', () => {
    return createNote()
      .then(({ body }) => {
        body.title = 'New Title';
        return request(app)
          .put(`/api/v1/notes/${body.id}`)
          .send(body)
          .expect(200);
      })
      .then(({ body }) => {
        expect(body.title).toBe('New Title');
      });
  });

  it('deletes a note', () => {
    return createNote()
      .then(({ body }) => {
        return request(app)
          .delete(`/api/v1/notes/${body.id}`)
          .expect(200)
          .then(({ body: removed }) => {
            expect(removed).toEqual(body);
            return body.id;
          });
      })
      .then(id => {
        return request(app)
          .get(`/api/v1/notes/${id}`)
          .expect(404);
      });
  });
});
