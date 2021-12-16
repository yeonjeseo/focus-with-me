// require() 는 JS 라이브러리/파일이다
const express = require("express");
const commentsRouter = express.Router();
const {
  postComments,
  getComments,
  deleteComments,
} = require("../controllers/commentsController");

const {
  postCmtsLikes,
  deleteCmtsLikes,
} = require("../controllers/likes-ctrl/cmtsLikeController");
const { logInOnly, logInBoth } = require("../middlewares/passport-auth");

commentsRouter
  .route("/posts/:postId/comments")
  .post(logInOnly, postComments)
  .get(logInBoth, getComments)
  .delete(logInOnly, deleteComments);

commentsRouter
  .route("/posts/:postId/comments/:commentId/like")
  .post(logInOnly, postCmtsLikes)
  .delete(logInOnly, deleteCmtsLikes);

module.exports = commentsRouter;
