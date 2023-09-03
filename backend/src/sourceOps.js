const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const dynamoHelper = require("../utils/dynamo.helper");
const s3Helper = require("../utils/s3.helper");
const common = require("./common");

const S3_BUCKET = "face-data-5409-ta-2";
const deleteHandler = async (event) => {
  try {
    const { email, label } = event.pathParameters;
    const dynamoObject = await dynamoHelper.getItemFromDynamoDB(
      dynamoDB,
      { email: email, faceLabel: label },
      "face-source"
    );
    console.log(dynamoObject);
    const { s3RawKey, s3ProcessedKey } = dynamoObject;
    await s3Helper.deleteObject(s3, S3_BUCKET, s3RawKey);
    console.log("Deleted Raw Files");
    await s3Helper.deleteObject(s3, S3_BUCKET, s3ProcessedKey);
    console.log("Deleted Processed Files");
    await dynamoHelper.deleteRecordFromDynamoDB(
      dynamoDB,
      { email: email, faceLabel: label },
      "face-source"
    );
    console.log("Deleted Dynamo Records");
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Records Deleted Successfully" }),
      headers: common.headers
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Specified Object Not Found" }),
      headers: common.headers
    };
  }
};

const getAllLabelsHandler = async (event) => {
  try {
    const { email } = event.pathParameters;
    const sourceObjects = await dynamoHelper.getFromEmail(
      dynamoDB,
      email,
      "face-source"
    );
    let sources = [];
    for (source of sourceObjects) {
      sources.push({label: source["faceLabel"], importId: source["importId"], status: source["importStatus"]});
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ sources: sources }),
      headers: common.headers
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Specified Object Not Found" }),
      headers: common.headers
    };
  }
};

const getByLabelHandler = async (event) => {
  try {
    const { email, label } = event.pathParameters;
    const dynamoObject = await dynamoHelper.getItemFromDynamoDB(
      dynamoDB,
      { email: email, faceLabel: label },
      "face-source"
    );
    console.log(dynamoObject);
    const { s3RawKey } = dynamoObject;
    const sourceImageBuffer = await s3Helper.get(s3, S3_BUCKET, s3RawKey);
    return {
      statusCode: 200,
      body: JSON.stringify({ label: label, sourceImageBase64: sourceImageBuffer.toString("base64") }),
      headers: common.headers
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Specified Object Not Found" }),
      headers: common.headers
    };
  }
};

const getImportStatusHandler = async (event) => {
  try {
    const { email, label } = event.pathParameters;
    const dynamoObject = await dynamoHelper.getItemFromDynamoDB(
      dynamoDB,
      { email: email, faceLabel: label },
      "face-source"
    );
    return {
      statusCode: 200,
      body: JSON.stringify({ status: dynamoObject["importStatus"] }),
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
  deleteHandler: deleteHandler,
  getAllLabelsHandler: getAllLabelsHandler,
  getByLabelHandler: getByLabelHandler,
  getImportStatusHandler: getImportStatusHandler
};
