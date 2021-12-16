// require() 는 JS 라이브러리/파일이다
const express = require("express");
const router = express.Router();
const {
  postComments,
  getComments,
  deleteComments,
} = require("../controllers/commentsController");
const { logInOnly, logInBoth } = require("../middlewares/passport-auth");

// 댓글 생성 라우터
router.post("/posts/:postId/comments", logInOnly, postComments);
// 댓글 조회 라우터
router.get("/posts/:postId/comments", logInBoth, getComments);

// 댓글 삭제 라우터
router.delete("/posts/:postId/comments/:commentId", logInOnly, deleteComments);

module.exports = router;
