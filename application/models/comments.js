var db = require("../config/database.js");
const CommentModel = {};
CommentModel.create = (userId, postId, comment) => {
  let baseSQL = `INSERT INTO comments (comment, fk_postId, fk_authorId, createdAt) VALUES (?,?,?, now());`;
  return db
    .query(baseSQL, [comment, postId, userId])
    .then(([results, fields]) => {
      if (results && results.affectedRows) {
        return Promise.resolve(results.insertId);
      } else {
        return Promise.resolve(-1);
      }
    })
    .catch((err) => Promise.reject(err));
};
CommentModel.getCommentsForPosts = (postId) => {
  let baseSQL = `SELECT u.username, c.comment, c.createdAt, c.id FROM comments c
  JOIN users u
  on u.id=fk_authorId WHERE c.fk_postId=? 
  ORDER BY c.createdAt DESC`;
  return db
    .query(baseSQL, [postId])
    .then(([results, fields]) => {
      return Promise.resolve(results);
    })
    .catch((err) => Promise.reject(err));
};
module.exports = CommentModel;
