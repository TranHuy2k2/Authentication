const User = require("../models/Users");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

let refreshTokens = [];
const authController = {
  // GENERATE TOKEN
  generateAccessToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        admin: user.admin,
      },
      process.env.JWT_ACCESS_KEY,
      { expiresIn: "30s" }
    );
  },
  generateRefreshToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        admin: user.admin,
      },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: "30s" }
    );
  },
  // REGISTER
  registerUser: async (req, res) => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(req.body.password, salt);

      // CREATE NEW USER
      const newUser = await new User({
        username: req.body.username,
        email: req.body.email,
        password: hashed,
      });
      // SAVE TO DB:
      const user = await newUser.save();
      res.status(200).json(user);
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  },
  loginUser: async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log(username, password);
      const user = await User.findOne({ username: username });
      if (!user) {
        return res.status(404).json("Wrong username");
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(404).json("Wrong password");
      }
      if (user && password) {
        const accessToken = authController.generateAccessToken(user);
        const refreshToken = authController.generateRefreshToken(user);
        refreshTokens.push(refreshToken);
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "strict",
        });
        const { password, ...others } = user._doc;
        res.status(200).json({ ...others, accessToken });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  },
  requestRefreshToken: (req, res) => {
    console.log(req.cookies);
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json("You are not authenticated");
    }
    if (!refreshTokens.includes(refreshToken))
      return res.status(403).json("Invalid Refresh Token");

    jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (error, user) => {
      if (error) {
        console.log(error);
      }
      refreshTokens.filter((token) => token !== req.cookies.refreshToken);
      const newAccessToken = authController.generateAccessToken(user);
      const newRefreshToken = authController.generateRefreshToken(user);
      refreshTokens.push(newRefreshToken);
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict",
      });
      res.status(200).json(newAccessToken);
    });
  },
  logOut: (req, res) => {
    res.clearCookie("refreshToken");
    refreshTokens.filter((token) => token !== req.cookies.refreshToken);
    res.status(200).json("Logout succeeded");
  },
};
module.exports = authController;
