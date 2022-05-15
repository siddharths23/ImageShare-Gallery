var express = require("express");
var router = express.Router();
var isLoggedIn = require("../middleware/routeprotectors").userIsLoggedIn;
var getRecentPosts = require("../middleware/postsmiddleware").getRecentPosts;

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

module.exports = router;
