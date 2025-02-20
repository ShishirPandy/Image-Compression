const { MongoClient } = require('mongodb');

MONGO_URI="mongodb+srv://abhi987012:bDJe2SNzr0vta0On@cluster0.bmaet.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
const client = new MongoClient(MONGO_URI);

async function connect() {
  await client.connect();
  console.log('Connected to MongoDB');
  return client.db('image_processing');
}

module.exports = connect;
