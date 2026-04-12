const Queue = require('bull');
const ingestQueue = new Queue('ingest', process.env.REDIS_URL);
module.exports = ingestQueue;
