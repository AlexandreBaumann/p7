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
  const timestamp = Date.now(); // Utilisez Date.now() pour obtenir le timestamp en tant que chaîne de chiffres
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
    next(error); // Transmettez les erreurs au gestionnaire d'erreur
  }
};

module.exports = {
  upload,
  imgProcess,
};
