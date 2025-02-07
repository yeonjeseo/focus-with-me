require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
const { sequelize } = require("./models");
const passport = require("passport");
const passportConfig = require("./passport");
const userRouter = require("./routes/users");
const postsRouter = require("./routes/posts");
const cmtRouter = require("./routes/comments");
const followRouter = require("./routes/follow");
const userInfoRouter = require("./routes/userInfo");
const bookmarkRouter = require("./routes/bookmark");
const childCommentRouter = require("./routes/childComments");
const { stream } = require("./config/logger");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger-output");

sequelize
  .sync({ force: false })
  .then(() => {
    console.log(
      `
      🐬🐬🐬🐬🐬🐬🐬🐬🐬🐬🐬🐬
      🐬🐬🐬🐬🐬🐬🐬🐬🐬🐬🐬🐬
      🐬🐬 돌고래 db 연결 🐬🐬
      🐬🐬🐬🐬🐬🐬🐬🐬🐬🐬🐬🐬
      🐬🐬🐬🐬🐬🐬🐬🐬🐬🐬🐬🐬
      🐙🐙🐙🐙🐙🐙🐙🐙🐙🐙🐙🐙
      🐙🐙🐙 나는 무너! 🐙🐙🐙
      🐙🐙 꿈을 꾸는 무너 🐙🐙
      🐙🐙🐙🐙🐙🐙🐙🐙🐙🐙🐙🐙
      `
    );
  })
  .catch((error) => {
    console.error(error);
  });

app.use(cors({ origin: true, credentials: true }));

app.use(
  morgan(
    `HTTP/:http-version :method :remote-addr [:url] :remote-user (:status) [:res[content-length]] [:referrer // :user-agent] [:response-time ms] `
  )
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//swagger
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerFile));

//passport
passportConfig();
// app.use(
//   session({
//     // false, 변경사항도 없는 session이 매번 다시 저장되는 걸 막아 작동 효율을 높임
//     resave: false,
//     // saveUninitialized: true => uninitialized 상태의 session을 강제로 저장,
//     // false => empty session obj가 쌓이는 걸 방지해 서버 스토리지를 아낄 수 있습니다.
//     saveUninitialized: false,
//     secret: "secret",
//     // 세션 쿠키 설정 (세션 관리 시 클라이언트에 보내는 쿠키)
//     cookie: {
//       httpOnly: true,
//       secure: false,
//     },
//   })
// );
app.use(passport.initialize());
// app.use(passport.session());

//routing
app.use("/api", cmtRouter);
app.use("/api", userRouter);
app.use("/api", postsRouter);
app.use("/api", followRouter);
app.use("/api", userInfoRouter);
app.use("/api", bookmarkRouter);
app.use("/api", childCommentRouter);

// metrics
const client = require("prom-client");

collectDefaultMetrics = client.collectDefaultMetrics;
client.collectDefaultMetrics({ timeOut: 5000 });

const counter = new client.Counter({
  name: "node_request_operations_total",
  help: "The total number of processed request",
});

const histogram = new client.Histogram({
  name: "node_request_duration_seconds",
  help: "Histogram for the durations in seconds",
  buckets: [1, 2, 5, 6, 10],
});

app.get("/", (req, res) => {
  const start = new Date();
  const simulateTime = 1000;

  setTimeout(() => {
    const end = new Date() - start;
    histogram.observe(end / 1000);
  }, simulateTime);
  counter.inc();

  res.send("에이치 아이");
});

app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", client.register.contentType);
  res.send(await client.register.metrics());
});

//Error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
