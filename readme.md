
# Serverless Face Labeler

Serverless Face Labeler is a web application that allows users to easily label faces in images. The backend of this application is built using various AWS services, including AWS Lambda, Step Functions, DynamoDB, and S3. The frontend is developed in React, providing an intuitive user interface for uploading and labeling images. AWS Rekognition API is utilized for the face labeling process.

## Features

- Upload a single source image containing a face.
- Upload target images, such as photos of people or group pictures.
- Automatically label the faces found in the uploaded target images.
- View and manage labeled faces in a user-friendly interface.
- Store labeled face data securely in DynamoDB.
- Serverless architecture ensures scalability and cost-efficiency.

## Architecture Overview

The Serverless Face Labeler utilizes the following AWS services:

- **AWS Lambda**: AWS Lambda functions are used to handle image processing and face labeling tasks.
- **Step Functions**: Step Functions are used to create workflows for processing and labeling images in a scalable and efficient manner.
- **DynamoDB**: DynamoDB is used to store and manage labeled face data, allowing for easy retrieval and updates.
- **S3**: S3 is used for storing uploaded images and labeled images.
- **AWS Rekognition**: AWS Rekognition API is employed for face detection and labeling in the images.

## Prerequisites

Before you begin using the Serverless Face Labeler, ensure you have the following:

- An AWS account with necessary permissions.
- Node.js and npm installed for frontend development.
- Serverless framework and AWS CLI installed for backend deployment.

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/serverless-face-labeler.git

2. Set up the frontend:
```bash
cd serverless-face-labeler/frontend
npm install
```

3. Set up the backend:
```bash
cd serverless-face-labeler/backend
npm install

```
4. Configure your AWS credentials using the AWS CLI:
```bash
aws configure
```

5. Deploy the backend:
```bash
serverless deploy
```

6. Deploy the frontend:
```bash
cd ../frontend
npm run build
```

7. Host the frontend using your preferred hosting service (e.g., AWS S3, Netlify, Vercel).

8. Access the deployed frontend and start labeling faces!

## Usage

1. Upload a single source image with a face to the application.
2. Upload target images that you want to label.
3. The application will automatically label the faces in the target images using AWS Rekognition.
4. View and manage labeled faces in the application's interface.
5. You can also retrieve labeled face data from DynamoDB for further analysis or integration with other services.
