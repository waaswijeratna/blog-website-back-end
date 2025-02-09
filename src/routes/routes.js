const express = require("express");

module.exports = (db) => {
  const router = express.Router();
  const { getPosts, getPostById, createPost, updatePost, deletePost, addComment } = require("../functions/postFunctions")(db);
  const { registerUser, loginUser } = require("../functions/authFunctions")(db);

  // Public routes
  router.get("/posts", getPosts);
  router.get("/posts/:id", getPostById);
  router.post("/posts", createPost);
  router.put("/posts/:id", updatePost);
  router.delete("/posts/:id", deletePost);
  router.post("/posts/:id/comments", addComment);

  // Auth routes
  router.post("/signup", registerUser);
  router.post("/login", loginUser);


  return router;
};