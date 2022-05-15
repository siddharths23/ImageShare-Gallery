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

module.exports = router;
