const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const dynamoHelper = require("../utils/dynamo.helper");
const s3Helper = require("../utils/s3.helper");
const common = require("./common");

const S3_BUCKET = "face-data-5409-ta-2";
const getImportStatusHandler = async (event) => {
  try {
    const { email, importId } = event.pathParameters;
    const dynamoObject = await dynamoHelper.getItemFromDynamoDB(
      dynamoDB,
      { email: email, importId: importId },
      "face-target"
    );
    return {
      statusCode: 200,
      body: JSON.stringify({ status: dynamoObject["status"] }),
      headers: common.headers
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Specified Object Not Found" }),
      headers: common.headers
    };
  }
};

const getTargetHandler = async (event) => {
  try {
    const { email, importId } = event.pathParameters;
    const dynamoObject = await dynamoHelper.getItemFromDynamoDB(
      dynamoDB,
      { email: email, importId: importId },
      "face-target"
    );
    console.log(dynamoObject);
    const { s3ProcessedKey } = dynamoObject;
    const targetImageBuffer = await s3Helper.get(s3, S3_BUCKET, s3ProcessedKey);
    console.log("Fetched Data from S3");
    return {
      statusCode: 200,
      body: JSON.stringify({
        importId: importId,
        sourceImageBase64: targetImageBuffer.toString("base64"),
      }),
      headers: common.headers
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Specified Object Not Found" }),
      headers: common.headers
    };
  }
};

const getAllTargetsHandler = async (event) => {
  try {
    const { email } = event.pathParameters;
    const targetObjects = await dynamoHelper.getFromEmail(
      dynamoDB,
      email,
      "face-target"
    );
    console.log(targetObjects);
    let targets = [];
    for (target of targetObjects) {
      targets.push({
        fileName: target["fileName"],
        importId: target["importId"],
      });
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ targets: targets }),
      headers: common.headers
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Specified Object Not Found" }),
      headers: common.headers
    };
  }
};

module.exports = {
  getImportStatusHandler: getImportStatusHandler,
  getTargetHandler: getTargetHandler,
  getAllTargetsHandler: getAllTargetsHandler,
};
