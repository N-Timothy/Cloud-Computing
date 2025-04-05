require("dotenv").config();
const express = require("express");
const path = require("path");
const galleryRoutes = require("./routes/gallery");

const app = express();

// Configure middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/gallery", galleryRoutes);

// Add route for the root path
// app.get("/", (req, res) => {
//   res.send("Welcome to my gallery");
// });

// Redirect root to gallery
app.get("/", (req, res) => {
  res.redirect("/gallery");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
