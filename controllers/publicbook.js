const Book = require("../models/book");
const fs = require("fs");

exports.getOneBook = (req, res, next) => {
  Book.findOne({
    _id: req.params.id,
  })
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.getBestrating = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 }) // Tri les livres par note moyenne en ordre décroissant
    .limit(3) // Retourne uniquement les 3 premiers livres
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};
