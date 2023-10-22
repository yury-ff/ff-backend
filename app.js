require("dotenv").config();
require("express-async-errors");
const cors = require("cors");

// express

const express = require("express");
const app = express();

// rest of the packages
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");

const mongoSanitize = require("express-mongo-sanitize");

// database
const connectDB = require("./db/connect");

//cors
app.use(cors());

//  routers
const balanceRouter = require("./routes/balanceRoutes");

// middleware

const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const transactionTracker = require("./utils/txs-tracker");
const vesterTracker = require("./utils/vesterTracker");

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(helmet());

app.use(xss());
app.use(mongoSanitize());

app.use(express.json());

app.use(fileUpload());

app.use("/api/v1/balances", balanceRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 4000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    await transactionTracker();
    await vesterTracker();

    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
