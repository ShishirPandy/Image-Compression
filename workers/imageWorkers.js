
const Queue = require('bull');
const imageService = require('../services/imageService'); 
const imageModel = require('../models/imageModel'); 

const imageQueue = new Queue('image-processing', {
  redis: { host: '127.0.0.1', port: 6379 },
});


imageQueue.on('error', (error) => console.error("❌ Queue Error:", error));
imageQueue.on('waiting', (jobId) => console.log(`⏳ Job waiting: ${jobId}`));
imageQueue.on('active', (job) => console.log(`🔄 Job active: ${job.id}`));
imageQueue.on('completed', (job) => console.log(`✅ Job completed: ${job.id}`));
imageQueue.on('failed', (job, err) => console.error(`❌ Job failed: ${job.id}, Error:`, err));


imageQueue.process('process-images',async (job, done) => {
  console.log(`🔄 Processing job ${job.id}...`);

  const { inputCsvFilePath, requestId } = job.data;

  if (!inputCsvFilePath || !requestId) {
    console.error("❌ Missing required job data: inputCsvFilePath or requestId");
    return done(new Error("Missing required job data"));
  }

  try {
    console.log(`📂 Parsing CSV for requestId: ${requestId}`);
    const results = await imageService.parseCsv(inputCsvFilePath);

    console.log(`✅ CSV parsed successfully for requestId: ${requestId}`);
    console.log(`🖼 Compressing and uploading images for requestId: ${requestId}`);

    await imageService.compressAndUploadImages(results, requestId);

    console.log(`✅ Images processed successfully for requestId: ${requestId}`);
    console.log(`🔄 Updating status to 'completed' for requestId: ${requestId}`);

    const updateResult = await imageModel.updateStatus(requestId, 'completed');

    if (updateResult.modifiedCount > 0) {
      console.log(`✅ Status updated to 'completed' for requestId: ${requestId}`);
    } else {
      console.warn(`⚠️ Status update failed for requestId: ${requestId}`);
    }

    done();
  } catch (error) {
    console.error(`❌ Error processing job ${job.id}:`, error);
    done(error); 
  }
});

console.log("🚀 Image Worker is running...");
module.exports = { imageQueue };

