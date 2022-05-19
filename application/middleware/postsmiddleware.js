const { getNRecentPosts, getPostById } = require("../models/Posts");
var db = require("../config/database");
const { getCommentsForPosts } = require("../models/comments");
const postMiddleware = {};

postMiddleware.getRecentPosts = async function (req, res, next) {
  try {
    let results = await getNRecentPosts(8);
    res.locals.results = results;
    if (results.length == 0) {
      req.flash("error", "there are no posts created!!");
    }
    next();
  } catch (err) {
    next(err);
  }
};

postMiddleware.getPostById = async function (req, res, next) {
  try {
    let postId = req.params.id;
    let results = await getPostById(postId);
    if (results && results.length) {
      res.locals.currentPost = results[0];
      next();
    } else {
      req.flash("error", "this is not the post youre looking for!");
      res.redirect("/");
    }
  } catch (error) {
    next(err);
  }
};
postMiddleware.getCommentsByPostId = async function (req, res, next) {
  let postId = req.params.id;
  try {
    let results = await getCommentsForPosts(postId);
    res.locals.currentPost.comments = results;
    next();
  } catch (error) {
    next(error);
  }
};
module.exports = postMiddleware;
