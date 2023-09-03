const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const stepfunctions = new AWS.StepFunctions();
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const dynamoHelper = require('../utils/dynamo.helper');
const uploadSourceStepFunctionArn = process.env.STEP_FUNCTION_ARN;
const common = require("./common");
if (!uploadSourceStepFunctionArn) {
  throw new Error("env STEP_FUNCTION_ARN is required");
}

const S3_BUCKET = "face-data-5409-ta-2";
module.exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { fileName, importId, email, imageBase64 } = body;
    const targetImageBuffer = Buffer.from(imageBase64, "base64");
    const fileExtension = fileName.split(".").at(-1);
    const s3RawKey = `${email}/target/raw/${importId}.${fileExtension}`;
    const s3RawParams = {
      Bucket: S3_BUCKET,
      Key: s3RawKey,
      Body: targetImageBuffer,
      ContentEncoding: "base64",
    };
    console.log(s3RawParams);
    await s3.putObject(s3RawParams).promise();
    const s3ProcessedKey = `${email}/target/processed/${importId}.${fileExtension}`;
    const dynamoParams = {
      email: email,
      importId: importId,
      status: "Processing",
      s3Bucket: S3_BUCKET,
      s3RawKey: s3RawKey,
      s3ProcessedKey: s3ProcessedKey,
      fileName: fileName
    }
    await dynamoHelper.putItemToDynamoDB(dynamoDB, dynamoParams, "face-target");
    const stateMachineInput = {
      importId: importId,
      s3RawKey: s3RawKey,
      bucket: S3_BUCKET,
      email: email,
      fileName: fileName
    }
    await startStepFunctionExecution(stateMachineInput);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "State Machine Execution Triggered Successfully",
      }),
      headers: common.headers
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error in Excecuting State Machine" }),
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
