const { Like } = require("../../models");
const { logger } = require("../../config/logger");

const postLikes = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = res.locals.user;
    const date = new Date();

    const liked = await Like.findOne({
      where: { postId, userId },
    });

    if (!liked) {
      await Like.create({
        postId,
        userId,
        date,
      });
      message = "좋아요를 눌렀습니다.";
      logger.info(`POST /api/posts/${postId}/like 200 res:${message}`);
      return res.status(200).send({ isLiked: true, message });
    } else {
      message = "좋아요를 이미 눌렀습니다.";
      logger.info(`POST /api/posts/${postId}/like 400 res:${message}`);
      // user가 좋아요를 이미 누른 상태에서 한번 더 눌렀을 경우
      return res.status(400).send({ message });
    }
  } catch (error) {
    console.log(error);
    message = "좋아요 기능에 문제가 있습니다. 관리자에게 문의해주세요.";
    logger.error(`POST /api/posts/${postId}/like 500 res:${error}`);
    return res.status(500).send({ message });
  }
};
// 게시물 좋아요 취소 기능
const deleteLikes = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = res.locals.user;

    const liked = await Like.findOne({
      where: { postId, userId },
    });

    if (liked) {
      await liked.destroy();
      message = "좋아요 취소";
      logger.info(`DELETE /api/posts/${postId}/like 200 res:${message}`);
      return res.status(200).send({ isLiked: false, message });
    } else {
      message = "이미 좋아요를 취소했습니다.";
      logger.info(`DELETE /api/posts/${postId}/like 400 res:${message}`);
      return res.status(400).send({ message });
    }
  } catch (error) {
    console.log(error); // catch error 문 이렇게 확인
    message = "좋아요 취소 기능에 문제가 있습니다. 관리자에게 문의해주세요.";
    logger.error(`DELETE /api/posts/${postId}/like 500 res:${error}`);
    return res.status(500).send({ message });
  }
};

module.exports = { postLikes, deleteLikes };
