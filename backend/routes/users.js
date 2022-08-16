const express = require("express");
const middlewareController = require("../controllers/middlewaresController");
const router = express.Router();
const usersController = require("../controllers/usersControllers");
// GET ALL USERS
router.get("/", middlewareController.verifytoken, usersController.getAllUsers);

// Delete User:
router.delete(
  "/:id",
  middlewareController.verifyTokenAndAdminAuth,
  usersController.deleteUser
);
module.exports = router;
