const express = require('express');
const router = express.Router();
const { createClient } = require('redis');

// Redis queue push function (could also use bull)
const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch(console.error);

router.post('/', async (req, res) => {
  if (!req.files || !req.files.document) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const file = req.files.document;
  // Read file data (Buffer) to send to pipeline
  const fileData = file.data.toString('base64'); // convert to base64 string
  // Push job to Redis list for pipeline worker
  await redisClient.lPush('ingestQueue', JSON.stringify({
    filename: file.name,
    data: fileData
  }));
  res.json({ status: 'queued', filename: file.name });
});

module.exports = router;
