const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'theamik',
  api_key: '799612787532988',
  api_secret: '-6u9W2ip9OthmTXSv7ByQOCdk1Q',
});

module.exports = cloudinary;
