var express = require("express");
var router = express.Router();
var isLoggedIn = require("../middleware/routeprotectors").userIsLoggedIn;
var getRecentPosts = require("../middleware/postsmiddleware").getRecentPosts;
var db = require("../config/database.js");

/* GET home page. */
router.get("/", getRecentPosts, function (req, res, next) {
  res.render("index", { title: "CSC 317 App", name: "Siddharth" });
});
router.get("/login", function (req, res, next) {
  res.render("login");
});
router.get("/registration", function (req, res, next) {
  res.render("registration");
});
router.get("/viewpost", function (req, res, next) {
  res.render("viewpost");
});
router.use("/postimage", isLoggedIn);
router.get("/postimage", function (req, res, next) {
  res.render("postimage");
});
router.get(`/post/:id(\\d+)`, (req, res, next) => {
  let baseSQL =
    " SELECT u.username, p.title, p.description, p.photopath, p.created \
  FROM users u \
  JOIN posts p \
  ON u.id=fk_userId \
  WHERE p.id= ?;";
  let postId = req.params.id;
  db.execute(baseSQL, [postId]).then(([results, fields]) => {
    if (results && results.length) {
      let post = results[0];
      res.render("imagepost", { currentPost: post });
    } else {
      req.flash("error", "This is not the post you are looking for!");
      res.redirect("/");
    }
  });
});
module.exports = router;
