const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", authMiddleware, authController.me);
router.patch("/me", authMiddleware, authController.updateMe);
router.get("/csrf", authController.csrf);

module.exports = router;
 