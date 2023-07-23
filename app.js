import { config } from "dotenv";
import  express  from "express";
import ErrorMiddleware from "./middleware/ErrorMiddleware.js";
import cookieParser from "cookie-parser";
import cors from "cors";
// Importing and using routes
import course from "./routes/courseRoutes.js";
import user from "./routes/userRoutes.js";
import payment from "./routes/paymentRoutes.js";
import other from "./routes/otherRoutes.js";

config({                   //add path to config file
    path:"./config/config.env",
});

const app = express();    // to create express app

// using middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
    })
);

app.use("/api/v1",course)
app.use("/api/v1",user)
app.use("/api/v1",payment)
app.use("/api/v1",other)


export default app;

app.get("/", (req, res) =>
  res.send(
    `<h1>Site is Working. Click <a href=${process.env.FRONTEND_URL} > here </a> to visit frontend </h1>`
  )
);

app.use(ErrorMiddleware);