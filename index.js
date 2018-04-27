var request = require("request").defaults({ encoding: null });;
var fs = require("fs");
var fileType = require("file-type");
var sharp = require("sharp");
var AWS = require("aws-sdk");

exports.getImageInBufferFromUrl = function(url) {
  var image ={};
  return new Promise(function(resolve, reject) {
    request.get(url, function(err, res, body) {
      if(err){
        reject(err);
      }
      image.buffer = body;
      image.name = url.split('/')[url.split('/').length-1]
      resolve(image);
    });
  })
}

exports.resizeImageFromBuffer = function(buffer, width, height){
  return new Promise(function(resolve, reject) {
    sharp(buffer)
      .resize(width, height,{kernel: sharp.kernel.nearest})
      .toBuffer()
      .then(function(resizedBuffer){
        resolve(resizedBuffer);
      }).catch(function(error){
        reject(error);
      });   
    })
};

exports.uploadBufferToS3 = function(
  fileStream,
  accessKeyId,
  secretAccessKey,
  bucketName,
  path,
  imageName
) {
  let s3client = new AWS.S3({
    accessKeyId: accessKeyId,
    secretAccessKey:
      secretAccessKey,
    params: {
      Bucket: bucketName,
      Key: path
    }
  });
  var imgtype = fileType(fileStream);
  var imgName = `${path}/${imageName}`;
  return new Promise(function(resolve, reject) {
    s3client.upload(
      {
        ACL: "public-read",
        ContentType: imgtype.mime,
        Body: fileStream,
        Key: imgName
      },
      function(err, result) {
        if(err){
          reject(err);
        }else{
          resolve(result);
        }     
      }
    );
  });
}

exports.resizeImageFromUrl = function(url, width, height){
  let image={};
  
  return new Promise(function(resolve, reject) {
    request.get(url, function(err, res, body) {
      if(err){
        reject(err);
      }
      sharp(body)
        .resize(width, height,{kernel: sharp.kernel.nearest})
        .toBuffer()
        .then(function(resizedBuffer){
          image.buffer = resizedBuffer;
          image.name = url.split('/')[url.split('/').length-1];
          resolve(image);
        }).catch(function(error){
          reject(error);
        });   
      })
    });  
};
