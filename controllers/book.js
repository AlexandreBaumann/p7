const Book = require("../models/book");
const fs = require("fs");
const path = require("path");
///////////////////////////////// CREATION ////////////////////////////////////////////////

exports.createBook = async (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    ratings: bookObject.ratings || [],
    imageUrl: `${req.protocol}://${req.get("host")}/${req.file.path}`,
  });

  book
    .save()
    .then(() => res.status(201).json({ message: "Objet enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
};

///////////////////////////////// NOTE - LIVRE NON CREE ////////////////////////////////////////////////

exports.rateBook = (req, res, next) => {
  const userId = req.body.userId;
  const rating = req.body.rating;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      const existingRating = book.ratings.find((r) => r.userId === userId);
      if (existingRating) {
        return res
          .status(400)
          .json({ message: "User has already rated this book." });
      } else {
        book.ratings.push({ userId: userId, grade: rating });
        const totalRatings = book.ratings.reduce((sum, r) => sum + r.grade, 0);
        const averageRating = totalRatings / book.ratings.length;
        book.averageRating = averageRating;

        book
          .save()
          .then(() =>
            res
              .status(201)
              .json({ message: "Rating added successfully!", _id: book._id })
          )
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

///////////////////////////////// MODIFICATION - LIVRE CREE ////////////////////////////////////////////////
exports.modifyBook = async (req, res, next) => {
  let bookObject;
  try {
    bookObject = req.body.book ? JSON.parse(req.body.book) : req.body;
  } catch (error) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  delete bookObject._id;
  delete bookObject._userId;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        if (req.file) {
          // Si une nouvelle image a été uploadée, supprimez l'ancienne image
          const oldImageUrl = book.imageUrl;
          const oldImageName = path.basename(oldImageUrl);
          const oldImagePath = path.join("./images", oldImageName);

          fs.unlink(oldImagePath, (err) => {
            if (err) {
              console.error(`Error deleting old image: ${err}`);
            }
          });

          // Mettez à jour l'URL de l'image
          bookObject.imageUrl = `${req.protocol}://${req.get("host")}/${
            req.file.path
          }`;
        }

        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Objet modifié!" }))
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

///////////////////////////////// SUPPRESSION ////////////////////////////////////////////////

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Objet supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

// calculer l'average rating à chaque nouvel enregistrement
