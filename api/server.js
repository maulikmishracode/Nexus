const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { createClient } = require('redis');
const { Pool } = require('pg');  // Or mysql2

// Load environment
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(require('express').static(require('path').join(__dirname, '../frontend')));
app.use(fileUpload());

// Database connection
const dbPool = new Pool({ connectionString: process.env.DB_URL });

// Redis connection
const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch(console.error);

// Attach routes
const uploadRoute = require('./routes/upload');
const askRoute = require('./routes/ask');
const graphRoute = require('./routes/graph');

app.use('/api/upload', uploadRoute);
app.use('/api/ask', askRoute);
app.use('/api/graph', graphRoute);

// Start server
app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});
