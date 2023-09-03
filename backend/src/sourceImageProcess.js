const AWS = require("aws-sdk");
const Jimp = require("jimp");
const s3 = new AWS.S3();
const rekognition = new AWS.Rekognition();
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3Helper = require("../utils/s3.helper");
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
  const sourceFaceDetails = await rekognitionHelper.getNumberOfFacesFromBase64(
    rekognition,
    sourceImageBuffer
  );
  console.log("Source Face Details: " + JSON.stringify(sourceFaceDetails));
  const sourceBoundingBox = sourceFaceDetails[0].BoundingBox;
  const croppedImageBuffer = await cropImage(
    sourceImageBuffer,
    sourceBoundingBox
  );
  console.log("Image Cropped");
  const s3ProccesedParams = {
    Bucket: s3Bucket,
    Key: s3ProcessedKey,
    Body: croppedImageBuffer,
    ContentEncoding: "base64",
  };
  await s3.putObject(s3ProccesedParams).promise();
  console.log("Image uploaded to S3");
  let dynamoParams = {
    email: email,
    faceLabel: faceLabel,
    importId: importId,
    importStatus: "Done",
    fileName: fileName,
    s3RawKey: s3RawKey,
    s3Bucket: s3Bucket,
    s3ProcessedKey: s3ProcessedKey,
  };
  await dynamoHelper.putItemToDynamoDB(dynamoDB, dynamoParams, "face-source");
  console.log("Dynamo Updated");
  return "Image Processed Successfully";
};

async function cropImage(imageBuffer, boundingBox) {
  const { Width, Height, Left, Top } = boundingBox;
  try {
    const image = await Jimp.read(imageBuffer);
    const imageWidth = image.bitmap.width;
    const imageHeight = image.bitmap.height;
    image.crop(
      Left * imageWidth,
      Top * imageHeight,
      Width * imageWidth,
      Height * imageHeight
    );
    image.scale(0.5);
    const croppedBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
    return croppedBuffer;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
