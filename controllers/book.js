const Book = require("../models/book");
const fs = require("fs");

///////////////////////////////// CREATION ////////////////////////////////////////////////

exports.createBook = (req, res, next) => {
  console.log("Raw request body:", req.body);
  console.log("File info:", req.file);
  console.log("Auth info:", req.auth);
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    ratings: bookObject.ratings || [],
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });

  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Objet enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

///////////////////////////////// NOTE - LIVRE NON CREE ////////////////////////////////////////////////

exports.rateBook = (req, res, next) => {
  const userId = req.body.userId;
  const rating = req.body.rating;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Vérifier si l'utilisateur a déjà noté le livre
      const existingRating = book.ratings.find((r) => r.userId === userId);

      if (existingRating) {
        // L'utilisateur a déjà noté le livre, vous pouvez choisir de mettre à jour la note ou de renvoyer une erreur
        return res
          .status(400)
          .json({ message: "User has already rated this book." });
      } else {
        // L'utilisateur n'a pas encore noté le livre, donc nous ajoutons sa note
        book.ratings.push({ userId: userId, grade: rating });

        // Calculer la nouvelle moyenne
        const totalRatings = book.ratings.reduce((sum, r) => sum + r.grade, 0);
        const averageRating = totalRatings / book.ratings.length;

        // Mettre à jour averageRating
        book.averageRating = averageRating;

        book
          .save()
          .then(() =>
            res.status(201).json({ message: "Rating added successfully!" })
          )
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

///////////////////////////////// MODIFICATION - LIVRE CREE ////////////////////////////////////////////////

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Objet modifié!" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
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
