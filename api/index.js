require("dotenv").config();
const express = require("express");
const apiRouter = express.Router();
const usersRouter = require("./users");
const postsRouter = require("./posts");
const tagsRouter = require("./tags");
const jwt = require("jsonwebtoken");
const { getUserById } = require("../db");
const { JWT_SECRET } = process.env;

apiRouter.use(async (req, res, next) => {
  // if (!req.headers.authorization) {
  //   next();
  //   return;
  // }

  const prefix = "Bearer ";
  const auth = req.header("Authorization");

  if (!auth) {
    next();
  } else if (auth.startsWith(prefix)) {
    const token = req.headers.authorization.split(" ")[1];
    // console.log(token);

    try {
      const { id } = jwt.verify(token, JWT_SECRET);

      if (id) {
        req.user = await getUserById(id);
        next();
      }
    } catch (error) {
      res.send({ error: "bad token" });
    }
  } else {
    next({
      name: "AuthorizationHeaderError",
      message: `Authorization token must start with ${prefix}`,
    });
  }

  // const token = req.headers.authorization.split(" ")[1];
  // console.log({ message: "success" });

  // try {
  //   const { id } = jwt.verify(token, process.env.JWT_SECRET);
  //   console.log(decoded);
  //   if (id) {
  //     req.user = await getUserById(id);
  //     next();
  //   }
  // } catch (error) {
  //   res.send({ error: "bad token" });
  // }
});

apiRouter.use((req, res, next) => {
  if (req.user) {
    console.log("User is set:", req.user);
  }

  next();
});

apiRouter.use("/users", usersRouter);

apiRouter.use("/posts", postsRouter);

apiRouter.use("/tags", tagsRouter);

apiRouter.use((error, req, res, next) => {
  res.send({
    name: error.name,
    message: error.message,
  });
});

module.exports = apiRouter;
