const connect = require('../utils/db');

const getCollection = async () => {
  const db = await connect();
  return db.collection('images');
};

const insertImage = async (imageData) => {
  const collection = await getCollection();
  await collection.insertOne(imageData);
};

const updateStatus = async (requestId, status) => {
  const collection = await getCollection();
  
  const result = await collection.updateOne(
    { requestId: requestId.trim() },  // Ensure consistent format
    { $set: { status } }
  );

  console.log(`🔄 Update Status Result for requestId ${requestId}:`, result);

  if (result.modifiedCount === 0) {
    console.warn(`⚠️ No document found to update for requestId: ${requestId}`);
  }

  return result; 
};

const getStatus = async (requestId) => {
  const trimmedRequestId = requestId.trim(); // Remove extra spaces

  console.log(`Searching for requestId: '${trimmedRequestId}'`);

  const collection = await getCollection();
  const result = await collection.findOne({ requestId: trimmedRequestId });

  console.log(`Database result:`, result); // Debugging output

  return result ? result.status : null;
};

module.exports = {
  insertImage,
  updateStatus,
  getStatus,
};
