import { Request, response, Response } from "express";
import express from "express";

// route
import productRouter from "./routes/productRoutes.js";
const app = express();

const port = 3001;

app.use("/api", productRouter);
app.get("/hello", (request: Request, response: Response): void => {
  response.send("hello world");
});

app.listen(port, () => {
  console.log("App is running at port " + port);
});
