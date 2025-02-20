const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const axios = require('axios');
const sharp = require('sharp');
const imageModel = require('../models/imageModel');
const { createObjectCsvWriter } = require('csv-writer');

const outputImagesDir = path.join(__dirname, '../uploads/output_images');
const outputCsvFilePath = path.join(outputImagesDir, 'output.csv'); // Store CSV inside output_images

// Ensure the output directory exists
if (!fs.existsSync(outputImagesDir)) {
  fs.mkdirSync(outputImagesDir, { recursive: true });
}

const parseCsv = (inputCsvFilePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(inputCsvFilePath)
      .pipe(csv({ headers: false }))  
      .on('data', (data) => results.push(Object.values(data))) 
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};
console.log("Calling compressAndUploadImages...");
const compressAndUploadImages = async (results, requestId) => {
  const outputData = [];
  
  for (const row of results) {
    console.log("Row Data:", row); 

    const serialNo = row[0];  
    const productName = row[1];  
    const inputImageUrls = row[2];  

    if (!inputImageUrls) {
      console.warn(`Skipping row ${serialNo} due to missing Input Image Urls`);
      continue;
    }

    const inputUrls = inputImageUrls.split(/[\n,]+/).map(url => url.trim());
    const outputUrls = [];

    for (const inputImageUrl of inputUrls) {
      try {
        const response = await axios.get(inputImageUrl, { responseType: 'arraybuffer' });

        if (response.status !== 200) {
          console.warn(`Skipping ${inputImageUrl} - Received status code ${response.status}`);
          continue;
        }

        const imageBuffer = Buffer.from(response.data, 'binary');
        const fileName = `${serialNo}_${path.basename(inputImageUrl)}`;
       
        const outputImagePath = path.join(outputImagesDir, fileName);

        await sharp(imageBuffer).resize({ width: 300 }).toFile(outputImagePath);

  
        const outputImageUrl = `uploads/output_images/${fileName}`;
        
        outputUrls.push(outputImageUrl);
      
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.warn(`Skipping ${inputImageUrl} - Image not found (404)`);
        } else {
          console.error(`Error processing ${inputImageUrl}:`, error.message);
        }
        continue; 
      }
    }

    const outputRow = { serialNo, productName, inputImageUrls, outputImageUrls: outputUrls.join(', ') };
    outputData.push(outputRow);

    await imageModel.insertImage({ ...outputRow, requestId, status: 'completed' });
  }


  const csvWriter = createObjectCsvWriter({
   
    path: outputCsvFilePath, 
    header: [
      { id: 'serialNo', title: 'S.No' },
      { id: 'productName', title: 'Product Name' },
      { id: 'inputImageUrls', title: 'Input Image Urls' },
      { id: 'outputImageUrls', title: 'Compressed Image Urls' }, 
    ],
    
    append: false,
     
  });

  await csvWriter.writeRecords(outputData);
  console.log(`✅ Output CSV saved to ${outputCsvFilePath}`);

  return outputData;
};

module.exports = {
  parseCsv,
  compressAndUploadImages,
};
