const { ObjectId } = require("mongodb");

module.exports = (db) => {
  return {
    getPosts: async (req, res) => {
      try {
        const { search, page = 1, limit = 9, userId } = req.query;
        console.log("Received userId:", userId); 

        const filter = search
          ? {
              $or: [
                { title: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } },
              ],
            }
          : {};

          if (userId) {
            filter.userId = userId; 
          }
          console.log("Mongo filter:", filter);
        
        const [posts, count] = await Promise.all([
          db.collection("posts")
            .find(filter)
            .skip((page - 1) * parseInt(limit))
            .limit(parseInt(limit))
            .sort({ dateCreated: -1 })
            .toArray(),
          db.collection("posts").countDocuments(filter)
        ]);
        console.log("Posts fetched:", posts); 


        res.json({ posts, total: count });
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch posts" });
      }
    },

    getPostById: async (req, res) => {
      try {
        const id = new ObjectId(req.params.id);
        const post = await db.collection("posts").findOne({ _id: id });
        post
          ? res.json(post)
          : res.status(404).json({ error: "Post not found" });
      } catch (error) {
        res.status(400).json({ error: "Invalid ID format" });
      }
    },

    createPost: async (req, res) => {
      try {
        const newPost = {
          ...req.body,
          dateCreated: new Date(),
          comments: [] 
        };
        const result = await db.collection("posts").insertOne(newPost);
        res.status(201).json(result);
      } catch (error) {
        res.status(500).json({ error: "Failed to create post" });
      }
    },

    updatePost: async (req, res) => {
      try {
        const id = new ObjectId(req.params.id);
        const result = await db.collection("posts").updateOne(
          { _id: id },
          { $set: req.body }
        );
        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Post not found" });
        }
        res.json({ message: "Post updated", modifiedCount: result.modifiedCount });
      } catch (error) {
        res.status(400).json({ error: "Invalid ID format" });
      }
    },

    deletePost: async (req, res) => {
      try {
        const id = new ObjectId(req.params.id);
        const result = await db.collection("posts").deleteOne({ _id: id });
        if (result.deletedCount === 0) {
          return res.status(404).json({ error: "Post not found" });
        }
        res.json({ message: "Post deleted" });
      } catch (error) {
        res.status(400).json({ error: "Invalid ID format" });
      }
    },

    addComment: async (req, res) => {
      try {
        const id = new ObjectId(req.params.id);
        const newComment = {
          name: req.body.name,
          comment: req.body.comment,
          date: new Date()
        };

        const result = await db.collection("posts").updateOne(
          { _id: id },
          { $push: { comments: newComment } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ error: "Post not found" });
        }
        res.json({ message: "Comment added", modifiedCount: result.modifiedCount });
      } catch (error) {
        res.status(400).json({ error: "Invalid ID format" });
      }
    }
  };
};
