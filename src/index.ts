import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import session from "express-session";
import { Server } from "socket.io";
import http from "http";

// controllers
import ChatController from "./controllers/chatController.js";

// routes
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
import messageRoutes from "./routes/messageRoutes.js";
const app = express();

const port = 3001;

app.set("trust proxy", 1);

const allowedOrigins = [
  "https://grocery-bnxp98vry-rully-fadhelis-projects.vercel.app",
  "https://grocery-five-chi.vercel.app",
  "https://grocery-rully-fadhelis-projects.vercel.app",
  "http://localhost:3000", // for local development
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    allowedHeaders: ["authorization", "Content-Type"],
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: true,
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none" as const,
      maxAge: 1000 * 60 * 10,
    },
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connect", (socket) => {
  console.log("socket connected");
  ChatController.handleChat(io, socket);
});

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
app.use("/api", messageRoutes);

server.listen(port, () => {
  console.log("App is running at port " + port);
});

export default app;
