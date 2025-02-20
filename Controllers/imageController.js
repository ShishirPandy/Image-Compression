const imageService = require('../services/imageService');
const imageModel = require('../models/imageModel');
const { v4: uuidv4 } = require('uuid');
const { imageQueue } = require('../workers/imageWorkers');

const uploadCsv = async (req, res) => {
  const requestId = uuidv4();
  const inputCsvFilePath = req.file.path;

  await imageModel.insertImage({ requestId, status: 'pending' });
  console.log("📌 Adding job to queue:", inputCsvFilePath, requestId);
  await imageQueue.add('process-images', { inputCsvFilePath, requestId });
  imageQueue.getJobCounts().then(counts => console.log("Queue Status:", counts));

  console.log("✅ Job added to queue");


  res.json({ requestId });
};

const getStatus = async (req, res) => {
  const { requestId } = req.params;
  console.log("testing 2");
  console.log(`Looking for requestId: "${requestId}"`);
  const status = await imageModel.getStatus(requestId);
  console.log(status,"testing 1");
  res.json(status);
};

module.exports = { uploadCsv, getStatus };
