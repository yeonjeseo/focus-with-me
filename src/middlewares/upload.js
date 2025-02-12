const multer = require("multer");
const path = require("path");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const s3 = new aws.S3();
// aws.config.loadFromPath(`${process.cwd()}/config/s3.js`);

module.exports = {
  //파일 생성 규칙
  // uploadAvatar: multer({
  //   storage: multer.diskStorage({
  //     destination(req, file, cb) {
  //       cb(null, "${__dirname}/../public/uploads/avatar");
  //     },
  //     /*       filename(req, file, cb) {
  //       // const fileName = randomstring.generate(20);
  //       const ext = path.extname(file.originalname);
  //       cb(null, Date.now() + ext);
  //     }, */
  //   }),
  //   limits: { fileSize: 10000000 },
  // }),
  uploadAvatarS3: multer({
    storage: multerS3({
      s3,
      bucket: "kkirri-images",
      acl: "public-read",
      key: (req, file, cb) => {
        console.log(file);
        cb(
          null,
          `uploads/avatar/${Date.now()}_${file.originalname
            .replace(/ /g, "")
            .trim()}`
        );
        // cb(null, `}`)
      },
    }),
  }),
  uploadContentS3: multer({
    storage: multerS3({
      s3,
      bucket: "kkirri-images",
      acl: " public-read",
      key: (req, file, cb) => {
        cb(
          null,
          `uploads/content/${Date.now()}_${file.originalname
            .replace(/ /g, "")
            .trim()}`
        );
      },
    }),
  }),
  uploadCoverS3: multer({
    storage: multerS3({
      s3,
      bucket: "kkirri-images",
      acl: " public-read",
      key: (req, files, cb) => {
        //여기서 분기처리 하면 되겠네
        if (files.fieldname === "coverOriginal")
          cb(
            null,
            `uploads/cover/${Date.now()}_${files.originalname
              .replace(/ /g, "")
              .trim()}`
          );
        else
          cb(
            null,
            `uploads/cropped/${Date.now()}_${files.originalname
              .replace(/ /g, "")
              .trim()}`
          );
        // cb(
        //   null,
        //   `uploads/cover/${Date.now()}_${file.originalname
        //     .replace(/ /g, "")
        //     .trim()}`
        // );
      },
    }),
  }),
  uploadTempS3: multer({
    storage: multerS3({
      s3,
      bucket: "kkirri-images",
      acl: " public-read",
      key: (req, file, cb) => {
        cb(
          null,
          `uploads/temp/${Date.now()}_${file.originalname
            .replace(/ /g, "")
            .trim()}`
        );
      },
    }),
  }),
  // uploadCover: multer({
  //   dest: "public/uploads/cover",
  //   limits: { fileSize: 10000000 },
  // }),
  // uploadContents: multer({
  //   dest: "public/uploads/content",
  //   limits: { fileSize: 10000000 },
  // }),
  // uploadTemp: multer({
  //   dest: "public/uploads/temp",
  //   limits: { fileSize: 1000000 },
  // }),
};
