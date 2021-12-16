const { CommentLike } = require("../../models");
const { logger } = require("../../config/logger");

const postCmtsLikes = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userId } = res.locals.user;

    const likeCmt = await CommentLike.findOne({
      where: { postId, commentId, userId },
    });

    if (!likeCmt) {
      const date = new Date();
      await CommentLike.create({
        postId,
        userId,
        commentId,
        date,
      });
      const likeCount = await CommentLike.count({
        where: { commentId, postId },
      });

      message = "댓글 좋아요.";
      logger.info(
        `POST /api/posts/${postId}/comments/${commentId}/like 200 res:${message}`
      );
      return res.status(200).send({
        isLiked: true,
        likeCount,
        message,
      });
    } else {
      message = "좋아요를 이미 눌렀습니다.";
      logger.info(
        `POST /api/posts/${postId}/comments/${commentId}/like 400 res:${message}`
      );
      return res.status(400).send({ message });
    }
  } catch (error) {
    console.log(error);
    message = "댓글 좋아요 기능에 문제가 생겼습니다.";
    logger.error(
      `POST /api/posts/${postId}/comments/${commentId}/like 500 res:${error}`
    );
    return res.status(500).send({ message });
  }
};
const deleteCmtsLikes = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userId } = res.locals.user;

    const likeCmt = await CommentLike.findOne({
      where: { postId, commentId, userId },
    });

    if (likeCmt) {
      await CommentLike.destroy({
        where: { postId, commentId, userId },
      });

      const likeCount = await CommentLike.count({
        where: { commentId, postId },
      });

      message = "댓글 좋아요 취소";
      logger.info(
        `DELETE /api/posts/${postId}/comments/${commentId}/like 200 res:${message}`
      );
      return res.status(200).send({
        isLiked: false,
        likeCount,
        message,
      });
    } else {
      message = "좋아요를 한 상태에서만 가능한 기능입니다.";
      logger.info(
        `DELETE /api/posts/${postId}/comments/${commentId}/like 400 res:${message}`
      );
      return res.status(400).send({ message });
    }
  } catch (error) {
    console.log(error);
    message = "관리자에게 문의해주세요.";
    logger.error(
      `DELETE /api/posts/${postId}/comments/${commentId}/like 500 res:${error}`
    );
    return res.status(500).send({ message });
  }
};

module.exports = { postCmtsLikes, deleteCmtsLikes };
