const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name:"dkdzlzntd",
    api_key:"179121763342268",
    api_secret:"nB1Wmp-YOzQCghbgkqlw4K8OS3I"

})

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'wanderlust',
      allowedFormats: ["png","jpg","jpeg"], // supports promises as well
     
    },
  });
  module.exports={
    cloudinary,storage,
  }