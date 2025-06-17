import { Request, response, Response } from "express";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
// route
import productRouter from "./routes/productRoutes.js";
import userRouter from "./routes/userRoutes.js";
const app = express();

const port = 3001;
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    allowedHeaders: "authorization",
  })
);
app.use(cookieParser());
app.use(express.json());

app.use("/api", productRouter);
app.use("/api", userRouter);

app.listen(port, () => {
  console.log("App is running at port " + port);
});
