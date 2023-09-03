const AWS = require("aws-sdk");
const Jimp = require("jimp");
const s3 = new AWS.S3();
const s3Helper = require("../utils/s3.helper");
const rekognition = new AWS.Rekognition();
const rekognitionHelper = require("../utils/rekognition.helper");
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const dynamoHelper = require("../utils/dynamo.helper");
const sns = new AWS.SNS();

module.exports.handler = async (event) => {
  try {
    const { importId, s3RawKey, bucket, email, fileName } = event;
    const sourceObjects = await dynamoHelper.getFromEmail(
      dynamoDB,
      email,
      "face-source"
    );
    console.log("Starting Face Matcher, Target Image is: " + fileName + " stored at : " + s3RawKey);
    const targetImageBuffer = await s3Helper.get(s3, bucket, s3RawKey);
    let labelledImage = targetImageBuffer;
    for (source of sourceObjects) {
      console.log("Comparing Source: ")
      console.log(source);
      const faceMatch = await rekognitionHelper.compareImages(
        rekognition,
        bucket,
        source["s3ProcessedKey"],
        bucket,
        s3RawKey
      );
      console.log(faceMatch);
      if (faceMatch.length == 0){
        console.log("No face match found for the above source, skipping current source");
        continue;
      }
      const { BoundingBox } = faceMatch[0].Face;
      labelledImage = await labelImage(
        labelledImage,
        BoundingBox,
        source["faceLabel"]
      );
    }
    // labelledImage = await applyTextColor(labelledImage);
    const fileExtension = s3RawKey.split(".").at(-1);
    const s3ProcessedKey = `${email}/target/processed/${importId}.${fileExtension}`;
    const s3ProccesedParams = {
      Bucket: bucket,
      Key: s3ProcessedKey,
      Body: labelledImage,
      ContentEncoding: "base64",
    };
    console.log("Saving Processed Image: " + s3ProcessedKey);
    await s3.putObject(s3ProccesedParams).promise();
    const dynamoParams = {
      email: email,
      importId: importId,
      status: "Done",
      s3Bucket: bucket,
      s3RawKey: s3RawKey,
      s3ProcessedKey: s3ProcessedKey,
      fileName: fileName,
    };
    await dynamoHelper.putItemToDynamoDB(dynamoDB, dynamoParams, "face-target");
    const allSNSTopics = await sns.listTopics({}).promise();
    const targetTopicName = email.replace(".", "-").replace("@", "-");
    let targetTopic = {};
    for (const topic of allSNSTopics.Topics){
      if (topic.TopicArn.includes(targetTopicName)){
        targetTopic = topic;
        break;
      }
    }
    console.log("Sending Email");
    const publishParams = {
      Subject: "Face Labelling Complete",
      Message: `The target image ${fileName} has finished processing. You can download it from the App's Website`,
      TopicArn: targetTopic.TopicArn,
    };
  
    await sns.publish(publishParams).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Image Processing Complete",
      }),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }
};

const labelImage = async (targetImageBuffer, boundingBox, matchedLabel) => {
  try {
    const targetImageObj = await Jimp.read(targetImageBuffer);
    const { Width, Height, Left, Top } = boundingBox;

    const imageWidth = targetImageObj.bitmap.width;
    const imageHeight = targetImageObj.bitmap.height;

    const x = Left * imageWidth;
    const y = Top * imageHeight;
    const width = Width * imageWidth;
    const height = Height * imageHeight;

    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    targetImageObj.print(
      font,
      x,
      y,
      {
        text: matchedLabel,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_TOP,
      },
      width,
      height
    );
    processedImageBuffer = await targetImageObj.getBufferAsync(Jimp.MIME_PNG);
    return processedImageBuffer;
  } catch (error) {
    console.log("Error in labelling Image");
    console.error(error);
    throw error;
  }
};