const get = async (s3, bucket, key) => {
  const params = {
    Bucket: bucket,
    Key: key,
  };

  return new Promise((resolve, reject) => {
    s3.getObject(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Body);
      }
    });
  });
};

const deleteObject = async (s3, bucket, key) => {
  const params = {
    Bucket: bucket,
    Key: key,
  };

  return new Promise((resolve, reject) => {
    s3.deleteObject(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

module.exports = {
  get: get,
  deleteObject: deleteObject
};
