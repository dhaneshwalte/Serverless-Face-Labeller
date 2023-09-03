const AWS = require("aws-sdk");
const bcrypt = require('bcryptjs');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();
const dynamoHelper = require("../utils/dynamo.helper");
const common = require("./common");

module.exports.handler = async (event) => {
  const { firstName, lastName, email, password } = JSON.parse(event.body);

  try {
    // Generate a salt and hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const dynamoObject = {
        firstName: firstName,
        lastName: lastName, 
        email: email, 
        hashedPassword: hashedPassword
    }
    await dynamoHelper.putItemToDynamoDB(dynamoDB, dynamoObject, 'users')

    const topic = await sns.createTopic({
      Name: email.replace(".", "-").replace("@", "-")
    }).promise();
    const subscriptionConfiguration = {
      Protocol: "email",
      Endpoint: email,
      TopicArn: topic.TopicArn,
    };

    await sns.subscribe(subscriptionConfiguration).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Registration successful!' }),
      headers: common.headers
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Something went wrong' }),
      headers: common.headers
    };
  }
};
