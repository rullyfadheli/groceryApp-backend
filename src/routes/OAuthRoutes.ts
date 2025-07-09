import express from "express";

const router = express.Router();

import OAuthController from "../controllers/OAuth.js";

router.get("/auth/google", (request, response) => {
  const authConteroller = new OAuthController();
  authConteroller.getGoogleAuthUrl(request, response);
});

router.get("/auth/google/callback", (request, response) => {
  const authConteroller = new OAuthController();
  authConteroller.handleGoogleCallback(request, response);
});

export default router;
