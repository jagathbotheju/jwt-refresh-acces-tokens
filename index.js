require("dotenv").config();
require("colors");
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/user");
const { errorHandler } = require("./middleware/errorMiddleware");

//middleware
const app = express();
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/user", userRoutes);

app.use(errorHandler);
const PORT = process.env.PORT;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `Server statred on port ${PORT} with MongoDB`.yellow.underline
      );
    });
  })
  .catch((error) => console.log(`${error} Did not connect to DB`));
