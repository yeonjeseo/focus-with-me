import { Request, Response } from "express";
import { Post, Bookmark, Like, User, sequelize } from "../models";
import { QueryTypes } from "sequelize";
import ControlS3 from "../library/controlS3";
import { logger } from "../config/logger";
const { extractImageSrcS3, copyImagesS3, removeObjS3 } = ControlS3;
/* option + shift + a */

interface MulterRequest extends Request {
  file: any;
}

class PostsController {
  /* 
    게시물 조회
  */
  public async getPosts(req: any, res: any) {
    //조회는 미들웨어에서 처리하고, 여기는 던지는 역할만 하기
    const {
      randPosts,
      posts,
      totalPage,
    }: { randPosts: Request<any>; posts: Request; totalPage: Request<any> } =
      req;
    const followPost = res.followPost;
    const message: string = "posts 조회 성공";
    logger.info(`GET /api/posts 200 res:${message}`);
    return res.status(200).send({
      message,
      posts,
      randPosts,
      followPost,
      totalPage,
    });
  }
  /* 
    게시물 생성
  */
  public async postPosts(req: Request, res: Response) {
    const files = JSON.parse(JSON.stringify(req.files));
    const originPath = req.files
      ? `uploads${files["coverOriginal"][0].location.split("uploads")[1]}`
      : "";
    const croppedPath = req.files
      ? `uploads${files["coverCropped"][0].location.split("uploads")[1]}`
      : "";
    const { userId } = res.locals.user;
    //multipart 에서 json 형식으로 변환
    const body = JSON.parse(JSON.stringify(req.body));
    const {
      title,
      categorySpace,
      categoryStudyMate,
      categoryInterest,
      contentEditor,
    }: {
      title: string;
      categorySpace: string;
      categoryStudyMate: string;
      categoryInterest: string;
      contentEditor: string;
    } = body;
    // image list 추출
    const imageList = extractImageSrcS3(contentEditor);
    console.log(imageList);
    // 비교 후 이동
    await copyImagesS3(imageList);

    // 모든 temp 경로를 content로 바꾸기
    const innerHtml = contentEditor.replace(/temp/g, "content");
    console.log(innerHtml);
    // 인코딩 해서 저장, why? 이모티콘
    const encodedTitle = encodeURIComponent(title);
    const encodedHTML = encodeURIComponent(innerHtml);
    const date = new Date();
    const post = {
      userId,
      coverCropped: croppedPath,
      coverOriginal: originPath,
      // imageCover: path,
      title: encodedTitle,
      categoryInterest,
      categorySpace,
      categoryStudyMate,
      contentEditor: encodedHTML,
      date,
    };
    try {
      await Post.create(post);
      const message: string = "게시물 작성 성공!";
      logger.info(`POST /api/posts 201 res:${message}`);
      return res.status(201).send({ message });
    } catch (error) {
      console.log(error);
      const message: string = "DB 저장에 실패했습니다.";
      logger.info(`POST /api/posts 500 res:${message}`);
      return res.status(500).send({ message });
    }
  }
  /* 
    게시물 수정
  */
  public async putPosts(req: Request, res: Response) {
    const { userId } = res.locals.user;
    const { postId } = req.params;
    const files = JSON.parse(JSON.stringify(req.files));

    // imageCover 파일이 없을 경우를 대비한 예외처리
    const originPath = files["coverOriginal"]
      ? `uploads${files["coverOriginal"][0].location.split("uploads")[1]}`
      : null;
    const croppedPath = files["coverCropped"]
      ? `uploads${files["coverCropped"][0].location.split("uploads")[1]}`
      : null;

    const body = JSON.parse(JSON.stringify(req.body));

    const {
      title,
      categoryInterest,
      categorySpace,
      categoryStudyMate,
      contentEditor,
    } = body;

    const post = await Post.findByPk(postId);
    const backup = post;

    try {
      // throw "error occurs!!!!!!!!!";
      //조회 결과가 없으면 이미 업로드된 cover 파일 다시 지워야 함.
      //조회 결과 게시물 주인이 현재 로그인한 사람 소유가 아니면 꺼져
      if (!post || userId !== post.userId) {
        // 이미 업로드된 이미지 삭제
        console.log("설마 여기로 오나?!!");
        // await removeObjS3(path);
        await removeObjS3(originPath);
        await removeObjS3(croppedPath);
        // 조건에 따라 status 분기
        if (!post) {
          const message: string = "해당 게시물이 존재하지 않습니다.";
          logger.info(`PUT /api/posts/${postId} 404 res:${message}`);
          return res.status(404).send({ message });
        } else {
          const message: string = "본인의 게시물만 수정할 수 있습니다.";
          logger.info(`PUT /api/posts/${postId} 404 res:${message}`);
          return res.status(403).send({ message });
        }
      }
      /*
        기존 이미지를 크로핑할 경우
        coverOriginal -> null
        coverCropped -> url
        coverOriginal -> null 일 경우, 기존 이미지를 삭제하면 안됨.
       */

      // 기존 이미지 삭제 - 수정 성공하고 난 뒤에 해도 늦지 않음
      // post 의 이미지 url 따라가서 삭제
      // 기존 본문 html을 디코딩
      const decodedHtml = decodeURIComponent(post.contentEditor);
      // 기존 본문에서 추출한 이미지 리스트
      const prevImageList = extractImageSrcS3(decodedHtml);
      const prevCoverOriginal = decodeURIComponent(post.coverOriginal);
      // 기존 크롭 이미지 url
      const prevCoverCropped = decodeURIComponent(post.coverCropped);

      // 새로 올라온 html에서 이미지 src 추출 후 파일 이동
      const imageList = extractImageSrcS3(contentEditor);
      await copyImagesS3(imageList);
      // 새로 온 본문 이미지 파일 이동이 끝나면, html temp -> content
      const innerHtml = contentEditor.replace(/temp/g, "content");

      // 수정 본문 이미지 처리가 안되어있음.
      //새로 올라온 데이터가 있을 때만 데이터 바꾸기
      // if (path) post.imageCover = path;
      if (originPath) post.coverOriginal = originPath;
      if (croppedPath) post.coverCropped = croppedPath;
      if (title) post.title = encodeURIComponent(title);
      if (categorySpace) post.categorySpace = categorySpace;
      if (categoryInterest) post.categoryInterest = categoryInterest;
      if (categoryStudyMate) post.categoryStudyMate = categoryStudyMate;
      if (contentEditor) post.contentEditor = encodeURIComponent(innerHtml);
      console.log(innerHtml);
      await post.save();
      const message: string = "게시물 수정 성공";
      logger.info(`PUT /api/posts/${postId} 204 res:${message}`);
      res.status(204).send({ message });

      //성공하면 기존 본문 이미지들 삭제
      // 안 쓰는 이미지 삭제 -> 기존 이미지 : 새로 들어온 이미지 비교를 안 함
      // if (prevImageList.length !== 0) {
      //   prevImageList.forEach(async (src) => {
      //     await removeObjS3(src);
      //   });
      // }
      // 커버 이미지 삭제 -> Null이 아닐 때에만 삭제 :
      // 새로 이미지가 올라올 때에만 삭제
      if (originPath) await removeObjS3(prevCoverOriginal);
      await removeObjS3(prevCoverCropped);
      return;
    } catch (error) {
      console.log(error);
      // 새로 넣으려던 데이터는 지운다. -> 원상복구 시켜야 함.
      // ROLLBACK : 기존데이터를 다시 넣고 저장.
      // 원상복구 해야할 요소 : 파일, DB
      // 기존 데이터를 어딘가에 백업해야할 듯.
      await post.update(backup);
      await post.save();

      await removeObjS3(originPath);
      await removeObjS3(croppedPath);
      const message: string = "DB 업데이트 실패";
      logger.error(`PUT /api/posts/${postId} 204 res:${message}`);
      return res.status(500).send({ message });
    }
  }
  /* 
    게시물 삭제
  */
  public async deletePosts(req: Request, res: Response) {
    const { postId } = req.params;
    const { userId } = res.locals.user;

    try {
      //이미지도 지워야겠네??
      const post = await Post.findByPk(postId);
      if (userId !== post.userId)
        return res.status(403).send({ message: "주인 아님" });
      // 게시물 삭제 전, 이미지 src 추출하고 삭제
      const decodedHtml = decodeURIComponent(post.contentEditor);
      const imgList = extractImageSrcS3(decodedHtml);

      for (const src of imgList) {
        await removeObjS3(src);
      }
      await removeObjS3(post.coverOriginal);
      await removeObjS3(post.coverCropped);
      await post.destroy();
      const message: string = "포스팅 삭제 성공";
      logger.info(`DELETE /api/posts/${postId} 200 res:${message}`);
      return res.status(200).send({ message });
    } catch (error) {
      console.log(error);
      const message: string = "포스팅 삭제 실패";
      logger.error(`DELETE /api/posts/${postId} 200 res:${error}`);
      return res.status(500).send({ message });
    }
  }
  /* 
    특정 게시물 조회
  */
  public async getOnePost(req: Request, res: Response) {
    const { postId } = req.params;
    // const userId = req.user ? req.user.userId : undefined;
    // 예외처리
    const { userId } = res.locals.user ? res.locals.user : { userId: null };
    // FE 뷰에 활용하기 위한 데이터
    let isBookmarked: boolean = false;
    let isLiked: boolean = false;
    let isFollowing: boolean = false;
    let currentNick: string = "";
    let currentAvatar: string = "";
    try {
      const post = await Post.findOne({
        where: { postId },
        include: {
          model: User,
          attributes: ["nickname", "avatarUrl"],
        },
      });
      // 사용자가 로그인 중이라면,
      if (userId) {
        const user = await User.findByPk(userId);
        currentNick = user.nickname;
        currentAvatar = user.avatarUrl;

        const bookmarked = await Bookmark.findOne({
          where: { postId, userId },
        });
        if (bookmarked) isBookmarked = true;
        const liked = await Like.findOne({
          where: { postId, userId },
        });
        if (liked) isLiked = true;
        // following 어떻게 판별하지??
        // 현재 로그인 한 사람이 게시물 작성자를 팔로잉하고 있는지??
        // 게시물 작성자의 userId를 가져와야 함
        const targetId = post.userId;
        const following = await sequelize.query(
          `SELECT * FROM Follow
        WHERE Follow.followingId=${targetId} AND Follow.followerId=${userId};`,
          { type: QueryTypes.SELECT }
        );
        if (following.length !== 0) isFollowing = true;
      }
      const message: string = "특정 게시물 1개를 조회 했습니다.";
      logger.info(`GET /api/posts/${postId} 200 res:${message}`);
      return res.status(200).send({
        post,
        isBookmarked,
        isLiked,
        isFollowing,
        currentNick,
        currentAvatar,
      });
    } catch (error) {
      console.log(error);
      const message: string = "DB 조회에 실패했습니다.";
      logger.error(`GET /api/posts/${postId} 500 res:${error}}`);
      return res.status(500).send({ message });
    }
  }
  /* 
    ckEditor 본문 이미지 업로드
  */
  public ckUpload(req: Request, res: Response) {
    const { file } = req as MulterRequest;
    const path = `uploads${file.location.split("uploads")[1]}`;
    console.log(path);
    logger.info(`POST /api/posts/ckUpload 201 res:${path} 경로 이미지 저장`);
    return res.status(201).send({ path });
  }
  /*
    크롭퍼에 넣어줄 이미지 가져온 뒤 보여주기
  */
  public async getCoverOriginal(req: Request, res: Response) {
    // 포스트 수정 시 이미지 가져오기
    const { postId } = req.params;
    /*
      예외 처리
      본인의 게시물이 맞는지
      게시물 DB 조회 결과 있는지
      S3 파일 조회 결과 있는지
     */

    try {
      const post = await Post.findByPk(postId);
      const coverOriginalUrl = post.coverOriginal;

      // const result = await getObjS3(coverOriginalUrl);
      // const base64Format = result.Body.toString("base64");
      // const utf8Format = result.Body.toString("utf-8");
      // const buffer = result.Body;
      logger.info(
        `POST /api/posts/${postId}/coverOriginal 200 res: 경로의 이미지 갖다주기!!`
      );
      // return res.status(200).send({ coverOriginalObj: base64Format });
      return res.status(200).send({ coverOriginalObj: coverOriginalUrl });
    } catch (error) {
      console.log(error);
      logger.error(`POST /api/posts/${postId}/coverOriginal 500 res:${error}`);
      return res.status(500).send({ message: "파일을 불러올 수 없습니다." });
    }
  }
}

export default new PostsController();
