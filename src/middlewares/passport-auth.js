const passport = require("passport");

//토큰이 없이 들어오면 빠꾸 --- 사유 : 회원 탈퇴-아에 접근하면 안됨, 게시글 작성-아에 접근하면 안됨, 좋아요 등등
exports.isLoggedIn = (req, res, next) => {
  try {
    passport.authenticate("jwt", (passportError, user, info) => {
      if (passportError) {
        next();
      } else {
        console.log(user);
      }
    })(req, res, next);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// 토큰이 없어도 들어와짐 // 하지만 토큰으로 정보를 가져오는 부분은 안보여줌.(대문 == following user의 게시글 목록)
exports.existLoggedIn = (req, res, next) => {};
