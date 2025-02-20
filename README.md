# Image Compression Service

## Overview

This project is a **Node.js** based image compression service that processes image URLs from an uploaded CSV file. It downloads, compresses, and stores the images, then generates an output CSV file with updated image links.

### Features:
- Upload a CSV file with image URLs
- Download and compress images using `sharp`
- Store compressed images in `/uploads/output_images/`
- Generate an output CSV file with compressed image URLs
- Uses **Bull** queue for background processing
- MongoDB stores request statuses
- Redis handles job queue management

---

## Installation & Setup

### Prerequisites:
- Node.js (v18+ recommended)
- Redis
- MongoDB

### Clone the repository:
```sh
git clone https://github.com/your-username/image-compression-service.git
cd image-compression-service
```

### Install dependencies:
```sh
npm install
```

### Start Redis Server:
```sh
redis-server
```

### Set up environment variables:
Create a `.env` file in the root directory with:
```sh
MONGO_URI=mongodb://localhost:27017/imageDB
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
PORT=3000
```

### Start the server:
```sh
npm start
```

### Start the worker process:
```sh
node workers/imageWorkers.js
```

---

## API Documentation

### 1️⃣ Upload CSV File
**Endpoint:** `POST /api/images/upload`
- **Headers:** `Content-Type: multipart/form-data`
- **Body:** `file (CSV file)`
- **Response:**
```json
{
  "requestId": "86dd02fa-3afc-41fd-8c66-1c4802dab0a2"
}
```

### 2️⃣ Check Job Status
**Endpoint:** `GET /api/images/status/:requestId`
- **Response:**
```json
{
  "requestId": "86dd02fa-3afc-41fd-8c66-1c4802dab0a2",
  "status": "completed",
  "outputCsv": "uploads/output_images/output.csv"
}
```

### 3️⃣ Download Processed CSV
**Endpoint:** `GET /uploads/output_images/output.csv`

---

## How It Works

1. A CSV file is uploaded containing image URLs.
2. The system processes each image:
   - Downloads the image.
   - Compresses it using `sharp`.
   - Stores it in `/uploads/output_images/`.
3. The processed image URLs are written into a new CSV file.
4. The request status is updated in MongoDB.

---

## Worker Process (Bull Queue)
The image compression runs asynchronously using **Bull Queue**.

**Worker Process Flow:**
1. The API queues a job after a CSV upload.
2. The worker fetches the job from Redis.
3. Each image is processed (downloaded, compressed, stored).
4. The output CSV file is generated.
5. MongoDB is updated with request status.

---

## Sample CSV Format

| Serial Number | Product Name  | ImageUrls |
|--------------|--------------|------------|
| 1           | Samsung Galaxy | `https://picsum.photos/id/237/200/300, https://picsum.photos/id/238/200/300` |
| 2           | iPhone 13     | `https://picsum.photos/id/239/200/300, https://picsum.photos/id/240/200/300` |

---
### File for testing : https://drive.google.com/file/d/1d_-SY7LJDaxK2LP3lv9Ak94g3ib2NNB1/view?usp=drive_link
## Future Enhancements
- Support for different image formats
- User authentication for API access
- Integration with cloud storage (AWS S3, Google Cloud Storage)
- Web UI for easier interaction

---

## License
This project is licensed under the **MIT License**.





