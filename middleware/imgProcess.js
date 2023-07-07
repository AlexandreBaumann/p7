const multer = require("multer");
const sharp = require("sharp");
const path = require("path");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite la taille de fichier à 5MB
  },
});

const imgProcess = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const { buffer, originalname } = req.file;
  const timestamp = Date.now();
  const ext = path.extname(originalname);
  const basename = path.basename(originalname, ext);
  const ref = `${basename}-${timestamp}${ext}`;
  try {
    sharp(buffer)
      .webp({ quality: 20 })
      .toFile("./images/" + ref);
    req.file.path = `images/${ref}`;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  upload,
  imgProcess,
};
