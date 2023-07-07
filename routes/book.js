const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { upload, imgProcess } = require("../middleware/imgProcess");

const bookPublicCtrl = require("../controllers/publicbook");
const bookCtrl = require("../controllers/book");

router.get("/bestrating/", bookPublicCtrl.getBestrating);
router.get("/:id", bookPublicCtrl.getOneBook);
router.get("/", bookPublicCtrl.getAllBooks);

router.post("/:id/rating", auth, bookCtrl.rateBook);
router.post("/", auth, upload.single("image"), imgProcess, bookCtrl.createBook);
router.put(
  "/:id",
  auth,
  upload.single("image"),
  imgProcess,
  bookCtrl.modifyBook
);
router.delete("/:id", auth, bookCtrl.deleteBook);

module.exports = router;

// library express rate limit
// gérer pagination (afficher petit à petit)
