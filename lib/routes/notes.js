const { Router } = require('express');
const client = require('../utils/client');

module.exports = Router()
  .get('/', (req, res, next) => {
    client.query(`
    SELECT
      id,
      author,
      title,
      created,
      is_published as "isPublished"
    FROM notes;
    `)
      .then(result => {
        res.send(result.rows);
      })
      .catch(next);
  })

  .post('/', (req, res, next) => {
    const { title, body, author } = req.body;

    client.query(`
      INSERT INTO notes (author, title, body)
      VALUES ($1, $2, $3)
      RETURNING 
        id, author, title, body, 
        created, is_published as "isPublished";
    `,
    [author, title, body]
    )
      .then(result => {
        res.send(result.rows[0]);
      })
      .catch(next);
  })

  .get('/:id', (req, res, next) => {
    client.query(`
      SELECT 
        id, 
        author, 
        title,
        body,
        created, 
        is_published as "isPublished"
      FROM notes
      WHERE id = $1;
    `,
    [req.params.id]
    )
      .then(result => {
        const note = result.rows[0];
        if(!note) {
          throw {
            status: 404,
            message: `Id ${req.params.id} does not exist`
          };
        }
        res.send(note);
      })
      .catch(next);
  })

  .put('/:id', (req, res, next) => {
    const { title, body, isPublished } = req.body;

    client.query(`
      UPDATE notes 
        SET title = $1,
            body = $2,
            is_published = $3
      WHERE id = $4
      RETURNING 
        id, author, title, body, 
        created, is_published as "isPublished";
    `,
    [title, body, isPublished, req.params.id]
    )
      .then(result => {
        res.send(result.rows[0]);
      })
      .catch(next);
  })

  .delete('/:id', (req, res, next) => {

    client.query(`
      DELETE FROM notes 
      WHERE id = $1
      RETURNING 
        id, author, title, body, 
        created, is_published as "isPublished";
    `,
    [req.params.id]
    )
      .then(result => {
        res.send(result.rows[0]);
      })
      .catch(next);
  });
