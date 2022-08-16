const express = require("express");
const authController = require("../controllers/authControllers");
const middlewaresController = require("../controllers/middlewaresController");
const router = express.Router();

// Register
router.post("/register", authController.registerUser);
// Login
router.post("/login", authController.loginUser);
// Request refresh token
router.post("/refreshtoken", authController.requestRefreshToken);
// Logout:
router.post(
  "/logout",
  middlewaresController.verifytoken,
  authController.logOut
);

module.exports = router;
