var express = require("express");
var router = express.Router();
var db = require("../config/database.js");
const { errorPrint, successPrint } = require("../helpers/debug/debugprinters");
var sharp = require("sharp");
var multer = require("multer");
var crypto = require("crypto");
var postError = require("../helpers/error/PostError");
const PostError = require("../helpers/error/PostError");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/uploads");
  },
  filename: function (req, file, cb) {
    let fileExt = file.mimetype.split("/")[1];
    let randomName = crypto.randomBytes(22).toString("hex");
    cb(null, `${randomName}.${fileExt}`);
  },
});
var uploader = multer({ storage: storage });

router.post("/createPost", uploader.single("uploadImage"), (req, res, next) => {
  let fileUploaded = req.file.path;
  let fileAsThumbnail = `thumbnail-${req.file.filename}`;
  let destinationOfThumbnail = req.file.destination + "/" + fileAsThumbnail;
  let title = req.body.title;
  let description = req.body.description;
  let fk_userId = req.session.userId;

  //do server validation

  sharp(fileUploaded)
    .resize(200)
    .toFile(destinationOfThumbnail)
    .then(() => {
      let baseSQL =
        "INSERT INTO posts (title, description, photopath, thumbnail, created, fk_userId) VALUE (?,?,?,?, now(),?);";
      return db.execute(baseSQL, [
        title,
        description,
        fileUploaded,
        destinationOfThumbnail,
        fk_userId,
      ]);
    })
    .then(([results, fields]) => {
      if (results && results.affectedRows) {
        req.flash("success", "Post created successfully!");
        res.redirect("/");
      } else {
        throw new PostError("post couldn't be created!", "/postImage", 200);
      }
    })
    .catch((err) => {
      if (err instanceof PostError) {
        errorPrint(err.getMessage());
        req.flash("error", err.getMessage());
        req.statusCode(err.getStatus());
        res.redirect(err.getRedirectURL());
      } else {
        next(err);
      }
    });
});
router.get("/search", (req, res, next) => {
  let searchTerm = req.query.search;
  if (!searchTerm) {
    res.send({
      resultsStatus: "info",
      message: "No search term given",
      results: [],
    });
  } else {
    let baseSQL =
      "SELECT id, title, description, thumbnail, concat_ws(' ', title, description) AS haystack \
    FROM posts \
    HAVING haystack like ?;";
    let sqlReadySearchTerm = "%" + searchTerm + "%";
    db.execute(baseSQL, [sqlReadySearchTerm])
      .then(([results, fields]) => {
        if (results && results.length) {
          res.send({
            resultsStatus: "info",
            message: `${results.length} results found`,
            results: results,
          });
        } else {
          db.query(
            "select id, title, description, thumbnail, created FROM posts ORDER BY created DESC LIMIT 8;",
            []
          ).then(([results, fields]) => {
            res.send({
              resultsStatus: "info",
              message: "No results found, here are the 8 recent posts",
              results: results,
            });
          });
        }
      })
      .catch((err) => next(err));
  }
});

module.exports = router;
