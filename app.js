require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const bookRoutes = require("./routes/book");
const userRoutes = require("./routes/user");

const app = express();
app.use(express.json());
app.use(cors());

const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;
const DB_NAME = process.env.DB_NAME;

const dbURI = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`;

mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use("/api/books", bookRoutes);
app.use("/api/auth", userRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
