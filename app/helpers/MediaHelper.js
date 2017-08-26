import multer from 'multer';

class MediaHelper {

  /**
    * @method getExtension
    * @param {String} filename
    * @desc gets the file extension from a filename
    * @return {String} the actual extension of the file
  */
  static getExtension(filename) {
    return str.substr(str.lastIndexOf('.') + 1);
  }

  /**
    * @method isAllowedFile
    * @param {String} filename
    * @desc checks if the file extension is allowed
    * @return {Boolean} return true if the file is allowed
  */
  static isAllowedFile(mimetype) {
    const img = ['jpg', 'jpeg', 'png'];
    const videos = ['mp4', 'mov', 'avi', '3gp', '3gpp', 'webm', 'mpeg'];
    const allowedFiles = img.concat(videos);
    const fileExtension =  mimetype.split('/')[1];

    return (allowedFiles.indexOf(fileExtension) >= 0);
  }

  static setupUploader() {
    const dest = 'uploads/';
    const uploader = multer({ dest, fileFilter: function(req, file, cb) {
      const mimetype = file.mimetype;
      if(MediaHelper.isAllowedFile(mimetype)) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    }});
    return uploader;
  }
}


export default MediaHelper;
