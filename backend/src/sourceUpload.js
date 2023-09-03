const AWS = require('aws-sdk');
const Jimp = require('jimp');
const s3 = new AWS.S3();
const stepfunctions = new AWS.StepFunctions();
const rekognition = new AWS.Rekognition();
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const dynamoHelper = require('../utils/dynamo.helper');
const rekognitionHelper = require('../utils/rekognition.helper');
const common = require("./common");

const uploadSourceStepFunctionArn = process.env.STEP_FUNCTION_ARN;
if (!uploadSourceStepFunctionArn) {
  throw new Error("env STEP_FUNCTION_ARN is required");
}

const S3_BUCKET = 'face-data-5409-ta-2';
module.exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const {fileName, importId, email, faceLabel, imageBase64} = body;
    const sourceImageBuffer = Buffer.from(imageBase64, 'base64');
    // const sourceFaceDetails = await rekognitionHelper.getNumberOfFacesFromBase64(rekognition, sourceImageBuffer);
    // console.log("Source Face Details: " + JSON.stringify(sourceFaceDetails));
    // const numFaces = sourceFaceDetails.length;
    // if (numFaces < 1) {
    //   console.error("No Face Detected");
    //   return {
    //     statusCode: 400,
    //     body: JSON.stringify({ message: 'No face detected in the source image' }),
    //   };
    // }
    // if (numFaces > 1) {
    //   console.error("Multiple faces detected");
    //   return {
    //     statusCode: 400,
    //     body: JSON.stringify({ message: 'Multiple faces detected in the source image' }),
    //   };
    // }
    const fileExtension = fileName.split(".")[1];
    const s3RawKey = `${email}/source/raw/${importId}.${fileExtension}`
    const s3RawParams = {
      Bucket: S3_BUCKET,
      Key: s3RawKey,
      Body: sourceImageBuffer,
      ContentEncoding: 'base64'
    };
    console.log(s3RawParams);
    await s3.putObject(s3RawParams).promise();

    // const sourceBoundingBox = sourceFaceDetails[0].BoundingBox;
    // const croppedImageBuffer = await cropImage(sourceImageBuffer, sourceBoundingBox);
    // const s3ProccesedParams = {
    //   Bucket: S3_BUCKET,
    //   Key: s3ProcessedKey,
    //   Body: croppedImageBuffer,
    //   ContentEncoding: 'base64'
    // };
    // await s3.putObject(s3ProccesedParams).promise();
    const s3ProcessedKey = `${email}/source/processed/${importId}.${fileExtension}`;
    let dynamoParams = {
      email: email,
      faceLabel: faceLabel,
      importId: importId,
      importStatus: "Processing",
      fileName: fileName,
      s3RawKey: s3RawKey,
      s3Bucket: S3_BUCKET,
      s3ProcessedKey: s3ProcessedKey
    }
    await dynamoHelper.putItemToDynamoDB(dynamoDB, dynamoParams, "face-source");
    const stateMachineInput = {
      email: email,
      faceLabel: faceLabel,
      importId: importId,
      fileName: fileName,
      s3RawKey: s3RawKey,
      s3Bucket: S3_BUCKET,
      s3ProcessedKey: s3ProcessedKey
    }
    await startStepFunctionExecution(stateMachineInput);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'State Machine Triggered Successfully' }),
      headers: common.headers
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Something went wrong' }),
      headers: common.headers
    };
  }
};
const startStepFunctionExecution = async (payload) => {
  const startExecutionParams = {
    stateMachineArn: uploadSourceStepFunctionArn,
    input: JSON.stringify(payload),
  };
  try {
    await stepfunctions.startExecution(startExecutionParams).promise();
  } catch (error) {
    console.log("Error executing StateMaching: " + JSON.stringify(error));
    throw (error);
  }
};

async function cropImage(imageBuffer, boundingBox) {
  const { Width, Height, Left, Top } = boundingBox;
  try{
    const image = await Jimp.read(imageBuffer);
    const imageWidth = image.bitmap.width;
    const imageHeight = image.bitmap.height;
    image.crop(Left * imageWidth, Top * imageHeight, Width * imageWidth, Height * imageHeight);
    image.scale(0.5);
    const croppedBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
    return croppedBuffer;
  }
  catch (error){
    console.error(error);
    throw(error);
  }
}