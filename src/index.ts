import { Request, Response } from "express";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
// route
import productRouter from "./routes/productRoutes.js";
import userRouter from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import checkoutRouter from "./routes/checkoutRoutes.js";
import couponRouter from "./routes/couponRoutes.js";
const app = express();

const onlineUsers = new Map<string, any>();

const port = 3001;
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["authorization", "Content-Type"],
  })
);
app.use(cookieParser());
app.use(express.json());

app.use("/api", couponRouter);
app.use("/api", checkoutRouter);
app.use("/api", productRouter);
app.use("/api", userRouter);
app.use("/api", orderRoutes);

app.listen(port, () => {
  console.log("App is running at port " + port);
});
