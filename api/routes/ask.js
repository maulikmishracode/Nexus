const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const dbPool = new Pool({ connectionString: process.env.DB_URL });

router.post('/', async (req, res) => {
  const question = req.body.question;
  if (!question) return res.status(400).json({ error: 'No question provided' });

  // Example: simple keyword search in documents (placeholder logic)
  const result = await dbPool.query(
    'SELECT answer FROM answers WHERE question ILIKE $1 LIMIT 1',
    [`%${question}%`]
  );
  const answer = result.rows.length ? result.rows[0].answer : "Sorry, I don't know";

  res.json({ answer });
});

module.exports = router;
