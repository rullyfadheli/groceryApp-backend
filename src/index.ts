import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from "express-session";
import { Server } from "socket.io";
import http from "http";

// route
import productRouter from "./routes/productRoutes.js";
import userRouter from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import checkoutRouter from "./routes/checkoutRoutes.js";
import couponRouter from "./routes/couponRoutes.js";
import OAuthRoutes from "./routes/OAuthRoutes.js";
import reviewRouter from "./routes/reviewRoutes.js";
import wishlistRouter from "./routes/wishlistRoutes.js";
import addressRouter from "./routes/addressRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import statisticRouter from "./routes/statisticRoutes.js";
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = 3001;
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["authorization", "Content-Type"],
  })
);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow connection from Next.js app
    methods: ["GET", "POST"],
  },
});

io.use((socket, next) => {});

app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: true,
    // cookie: {
    //   httpOnly: true,
    //   secure: true, // true in production with HTTPS
    //   sameSite: "none",
    // },
  })
);

app.use("/api", couponRouter);
app.use("/api", checkoutRouter);
app.use("/api", productRouter);
app.use("/api", userRouter);
app.use("/api", orderRoutes);
app.use("/", OAuthRoutes);
app.use("/api", reviewRouter);
app.use("/api", wishlistRouter);
app.use("/api", addressRouter);
app.use("/api", adminRouter);
app.use("/api", statisticRouter);

app.listen(port, () => {
  console.log("App is running at port " + port);
});

export default app;
