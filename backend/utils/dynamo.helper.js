const getItemFromDynamoDB = async (dynamoDB, key, tableName) => {
  const params = {
    TableName: tableName,
    Key: key,
  };

  try {
    const response = await dynamoDB.get(params).promise();
    return response.Item;
  } catch (error) {
    console.error("Error retrieving item from DynamoDB:", error);
    throw(error)
  }
}

const putItemToDynamoDB = async (dynamoDB, attributes, tableName) => {
  const params = {
    TableName: tableName,
    Item: attributes,
  };

  try {
    const response = await dynamoDB.put(params).promise();
  } catch (error) {
    console.error("Error Putting item to DynamoDB:", error);
    throw (error);
  }
}

const getFromEmail = async (dynamoDB, email, tableName) => {
  const params = {
    TableName: tableName,
    KeyConditionExpression: '#email = :email',
    ExpressionAttributeNames: {
      '#email': 'email',
    },
    ExpressionAttributeValues: {
      ':email': email,
    },
  };

  try {
    const data = await dynamoDB.query(params).promise();
    return data.Items; // Returns an array of objects matching the specified email
  } catch (error) {
    console.error('Error fetching data:', error);
    throw (error);
  }
};

const deleteRecordFromDynamoDB = async (dynamoDB, key, tableName) => {
  const params = {
    TableName: tableName,
    Key: key,
  };
  try{
    return await dynamoDB.delete(params).promise();
  } catch (error) {
    console.log(error);
    throw (error);
  }
}

module.exports = {
    putItemToDynamoDB: putItemToDynamoDB,
    getItemFromDynamoDB: getItemFromDynamoDB,
    getFromEmail: getFromEmail,
    deleteRecordFromDynamoDB: deleteRecordFromDynamoDB
}
