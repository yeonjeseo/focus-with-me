require("dotenv").config();
const aws = require("aws-sdk");
const s3 = new aws.S3();
/**
 * - 파일 이동
 * - 파일 삭제
 * - 폴더 삭제
 */
const extractImageSrcS3 = (html) => {
  try {
    const regexp = /<img[^>]+src\s*=\s*['"]([^'"]+)['"][^>]*>/g;
    const srcs = html.match(regexp);
    const imageList = [];
    console.log(srcs);
    if (srcs) {
      srcs.forEach((src) => {
        const imageUrl = "uploads" + src.split("uploads")[1].slice(0, -2);
        imageList.push(imageUrl);
      });
    }
    return imageList;
  } catch (error) {
    console.log(error);
    return [];
  }
};

const copyImagesS3 = async (imageList) => {
  try {
    /**
     * 이미지 리스트에서 파일 이름만 추출
     * 각 파일이 새로운 경로 key가 되고, copyObject 수행
     */
    for (const url of imageList) {
      const filename = url.split("temp/")[1];
      await s3
        .copyObject({
          Bucket: process.env.S3_BUCKET_NAME,
          CopySource: `kkirri-images/${url}`,
          Key: `uploads/content/${filename}`,
          ACL: "public-read",
        })
        .promise();
    }
    return;
  } catch (error) {
    console.log(error);
    return;
  }
};

/**
 * root 이 후의 경로가 Key
 * temp/1636955398064_20170716_211848140_iOS.jpg
 */

// 배열까지 처리할 수 있도록 만들어보기
const removeObjS3 = async (src) => {
  try {
    await s3
      .deleteObject({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: src,
      })
      .promise();
  } catch (error) {
    console.log(error);
    return;
  }
};

const emptyTempS3 = async () => {
  // 인터넷에서 긁어온 코드
  // 로직 모름;;; 공부 필요
  const listParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Prefix: "uploads/temp",
  };

  const listedObjects = await s3.listObjectsV2(listParams).promise();

  // 폴더 내 파일이 없으면 함수 종료
  if (listedObjects.Contents.length === 0) return;

  const deleteParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Delete: { Objects: [] },
  };

  listedObjects.Contents.forEach(({ Key }) => {
    deleteParams.Delete.Objects.push({ Key });
  });

  await s3.deleteObjects(deleteParams).promise();

  if (listedObjects.IsTruncated) await emptyTempS3();
};

const getObjS3 = async (src) => {
  try {
    const result = await s3
      .getObject({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: src,
      })
      .promise();

    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
};

module.exports = {
  removeObjS3,
  extractImageSrcS3,
  copyImagesS3,
  emptyTempS3,
  getObjS3,
};
