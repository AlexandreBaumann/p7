const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

const bookPublicCtrl = require("../controllers/publicbook");
const bookCtrl = require("../controllers/book");

router.get("/bestrating/", bookPublicCtrl.getBestrating);
router.get("/:id", bookPublicCtrl.getOneBook);
router.get("/", bookPublicCtrl.getAllBooks);

router.post("/:id/rating", auth, bookCtrl.rateBook);
router.post("/", auth, multer, bookCtrl.createBook);
router.put("/:id", auth, multer, bookCtrl.modifyBook);
router.delete("/:id", auth, bookCtrl.deleteBook);

module.exports = router;

// optimiser les images reçues dans le backend
// library sharp

// library express rate limit
// gérer pagination (afficher petit à petit)
