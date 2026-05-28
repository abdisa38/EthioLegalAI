const express = require("express");
const authController = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { registerSchema, loginSchema } = require("../validators/authSchemas");
const { authLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

router.post("/register", authLimiter, validate(registerSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/refresh", authLimiter, authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", requireAuth, authController.profile);

module.exports = router;
