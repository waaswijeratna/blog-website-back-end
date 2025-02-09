const express = require("express");
const connectDB = require("./src/services/db");
const cors = require("cors");
require("dotenv").config();

const startServer = async () => {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  try {
    const db = await connectDB();
    
    app.use("/api", require("./src/routes/routes")(db));

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
};

startServer();