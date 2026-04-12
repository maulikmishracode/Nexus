const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const dbPool = new Pool({ connectionString: process.env.DB_URL });

router.get('/', async (req, res) => {
  // Example: fetch all nodes and edges
  const nodesResult = await dbPool.query('SELECT id, label, group FROM nodes');
  const edgesResult = await dbPool.query('SELECT id, from_id AS from, to_id AS to, label FROM edges');

  // Map to network format
  const nodes = nodesResult.rows.map(r => ({ id: r.id, label: r.label, group: r.group }));
  const edges = edgesResult.rows.map(r => ({ id: r.id, from: r.from, to: r.to, label: r.label }));

  res.json({ nodes, edges });
});

module.exports = router;
