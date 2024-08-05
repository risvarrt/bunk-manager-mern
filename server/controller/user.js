const bcrypt = require('bcryptjs');
const {
  createUser,
  findByCredentials,
  generateAuthToken,
  getUserByEmail,
  deleteUser,
  removeSensitiveData,
  updateUser,
  logoutUser,
  logoutAllSessions
} = require('../models/user');
const email = require('../utils/email');

const registerUser = async (req, res) => {
  try {
    const user = await createUser(req.body);
    await email(
      user.name,
      user.email,
      user.department,
      user.roles,
      user.regdId,
    );

    const token = await generateAuthToken(user);
    res.status(201).send({ user: removeSensitiveData(user), token });
  } catch (e) {
    res.status(500).send({ msg: e.message });
  }
};

const removeUser = async (req, res) => {
  try {
    await deleteUser(req.user.regdId);
    res.status(200).send({ message: 'User deleted successfully' });
  } catch (e) {
    res.status(500).send({ msg: "Unable to delete" });
  }
};

const updateUserController = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "password", "currentSemester"];
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(500).send();
  }

  try {
    const user = await getUserByEmail(req.user.email);
    if (!user) {
      return res.status(400).send({ msg: "No such User Found" });
    }
    const updatedFields = {};
    for (const update of updates) {
      if (update === "password") {
        updatedFields[update] = await bcrypt.hash(req.body[update], 8);
      } else {
        updatedFields[update] = req.body[update];
      }
    }

    const updatedUser = await updateUser(user.regdId, updatedFields);
    res.status(200).send({ user: removeSensitiveData(updatedUser) });
  } catch (e) {
    res.status(400).send({ msg: e.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const user = await findByCredentials(req.body.email, req.body.password);
    const token = await generateAuthToken(user);
    res.status(200).send({ user: removeSensitiveData(user), token });
  } catch (e) {
    console.error(e);
    res.status(500).send({ msg: e.message });
  }
};

const logout = async (req, res) => {
  try {
    await logoutUser(req.user.email, req.token);
    res.send({ msg: "Logged out successfully" });
  } catch (e) {
    console.error("Logout error:", e);
    res.status(500).send({ msg: "Internal Server Error" });
  }
};

const logoutAll = async (req, res) => {
  try {
    await logoutAllSessions(req.user.email);
    res.send({ msg: "Logged out successfully from all devices" });
  } catch (e) {
    res.status(500).send(e);
  }
};

const userData = async (req, res) => {
  try {
    const user = await getUserByEmail(req.user.email);
    res.send({ user: removeSensitiveData(user), token: req.token });
  } catch (e) {
    res.status(500).send(e);
  }
};

module.exports = {
  registerUser,
  removeUser,
  updateUser: updateUserController,
  loginUser,
  logout,
  logoutAll,
  userData,
};
