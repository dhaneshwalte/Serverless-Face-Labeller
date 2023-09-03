const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const s3Helper = require("../utils/s3.helper");
const rekognition = new AWS.Rekognition();
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const dynamoHelper = require("../utils/dynamo.helper");
const rekognitionHelper = require("../utils/rekognition.helper");

const S3_BUCKET = "face-data-5409-ta-2";
module.exports.handler = async (event) => {
  const {
    email,
    faceLabel,
    importId,
    s3RawKey,
    s3ProcessedKey,
    fileName,
    s3Bucket,
  } = event;
  console.log(event);
  const sourceImageBuffer = await s3Helper.get(s3, s3Bucket, s3RawKey);
  console.log("Pulled Source Image from S3");
  const sourceFaceDetails = await rekognitionHelper.getNumberOfFacesFromBase64(
    rekognition,
    sourceImageBuffer
  );
  console.log("Source Face Details: " + JSON.stringify(sourceFaceDetails));
  const numFaces = sourceFaceDetails.length;
  if (numFaces < 1) {
    const dynamoParams = {
      email: email,
      faceLabel: faceLabel,
      importId: importId,
      importStatus: "No Face Detected",
      fileName: fileName,
      s3RawKey: s3RawKey,
      s3Bucket: s3Bucket,
      s3ProcessedKey: s3ProcessedKey,
    };
    await dynamoHelper.putItemToDynamoDB(dynamoDB, dynamoParams, "face-source");
    console.error("No Face Detected");
    throw Error("No Face Detected");
  }
  if (numFaces > 1) {
    const dynamoParams = {
      email: email,
      faceLabel: faceLabel,
      importId: importId,
      importStatus: "Multiple Faces Detected",
      fileName: fileName,
      s3RawKey: s3RawKey,
      s3Bucket: s3Bucket,
      s3ProcessedKey: s3ProcessedKey,
    };
    await dynamoHelper.putItemToDynamoDB(dynamoDB, dynamoParams, "face-source");
    console.error("Multiple faces detected");
    throw Error("Multiple faces detected");
  }
  console.log("Image Contains One Face");
  return event;
};
