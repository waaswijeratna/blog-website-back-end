const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = (db) => {
  const usersCollection = db.collection("users");
  const saltRounds = 10;

  return {
    registerUser: async (req, res) => {
      try {
        const { email, password, name } = req.body;

        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await usersCollection.insertOne({
          email,
          password: hashedPassword,
          name,
          createdAt: new Date(),
        });

        const token = jwt.sign(
          { id: newUser.insertedId, email },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        res.status(201).json({
          message: "User registered successfully",
          token,
          user: { id: newUser.insertedId, name, email },
        });
      } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
      }
    },

    loginUser: async (req, res) => {
      try {
        const { email, password } = req.body;
        const user = await usersCollection.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
          { id: user._id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        res.json({
          message: "Login successful",
          token,
          user: { id: user._id, name: user.name, email: user.email },
        });
      } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
      }
    },
  };
};
