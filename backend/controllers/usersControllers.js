const User = require("../models/Users");

const usersControllers = {
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json(error);
    }
  },
  deleteUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      res.status(200).json("Delete Succeded");
    } catch (error) {
      res.status(500).json(error);
    }
  },
};
module.exports = usersControllers;
