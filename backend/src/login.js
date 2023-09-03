const AWS = require("aws-sdk");
const bcrypt = require("bcryptjs");
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const dynamoHelper = require("../utils/dynamo.helper");
const common = require("./common");

module.exports.handler = async (event) => {
  const { email, password } = JSON.parse(event.body);
  try {
    const { hashedPassword } = await dynamoHelper.getItemFromDynamoDB(
      dynamoDB,
      { email: email },
      "users"
    );
    console.log(hashedPassword);
    // Compare the input password with the hashed password
    const passwordMatch = await bcrypt.compare(password, hashedPassword);

    if (passwordMatch) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Login successful!" }),
        headers: common.headers,
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid credentials" }),
        headers: common.headers,
      };
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid Credentials" }),
      headers: common.headers,
    };
  }
};
