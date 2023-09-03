const getFaceDetailsFromS3 = async (rekognition, bucketName, imageName) => {
  try {
    const params = {
      Image: {
        S3Object: {
          Bucket: bucketName,
          Name: imageName,
        },
      },
      Attributes: ["ALL"],
    };

    const response = await rekognition.detectFaces(params).promise();
    return response.FaceDetails;
  } catch (err) {
    console.error("Error detecting faces:", err);
    throw err;
  }
}

const getNumberOfFacesFromBase64 = async (rekognition, imageBuffer) => {
  try {
    // Detect faces in the image
    const params = {
      Image: {
        Bytes: imageBuffer,
      },
      Attributes: ['ALL'],
    };

    const response = await rekognition.detectFaces(params).promise();
    return response.FaceDetails;
  } catch (err) {
    console.error('Error detecting faces:', err);
    throw err;
  }
}

const compareImages = async ( rekognition, sourceBucket, sourceImage, targetBucket, targetImage ) => {
  const params = {
    SourceImage: {
      S3Object: {
        Bucket: sourceBucket,
        Name: sourceImage,
      },
    },
    TargetImage: {
      S3Object: {
        Bucket: targetBucket,
        Name: targetImage,
      },
    },
    SimilarityThreshold: 90,
  };
  try {
    const result = await rekognition.compareFaces(params).promise();
    console.log(result);
    return result.FaceMatches;
  } 
  catch (error) {
    console.error("Error in comparing images: " + JSON.stringify(error));
    throw (error);
  }
}

module.exports = {
    getFaceDetailsFromS3: getFaceDetailsFromS3,
    getNumberOfFacesFromBase64: getNumberOfFacesFromBase64,
    compareImages: compareImages
}
