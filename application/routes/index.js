var express = require("express");
var router = express.Router();
var isLoggedIn = require("../middleware/routeprotectors").userIsLoggedIn;
var {
  getRecentPosts,
  getPostById,
  getCommentsByPostId,
} = require("../middleware/postsmiddleware");
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

router.use("/postimage", isLoggedIn);
router.get("/postimage", function (req, res, next) {
  res.render("postimage");
});
router.get(
  `/post/:id(\\d+)`,
  getPostById,
  getCommentsByPostId,
  (req, res, next) => {
    res.render("imagepost", {
      title: `Post ${req.params.id}`,
    });
  }
);
module.exports = router;
