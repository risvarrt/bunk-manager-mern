const {
  createUser,
  findByCredentials,
  generateAuthToken,
  getUserByEmail,
  deleteUser,
  removeSensitiveData,
  dynamoDB 
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
    console.error(e); // Log the detailed error
    res.status(500).send({ msg: e.message }); // Send the error message in the response
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

const updateUser = async (req, res) => {
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
    for (const update of updates) {
      if (update === "password") {
        user.password = await bcrypt.hash(req.body[update], 8);
      } else {
        user[update] = req.body[update];
      }
    }

    const params = {
      TableName: "Users",
      Key: { regdId: user.regdId },
      UpdateExpression: "set #name = :name, #password = :password, #currentSemester = :currentSemester",
      ExpressionAttributeNames: {
        "#name": "name",
        "#password": "password",
        "#currentSemester": "currentSemester"
      },
      ExpressionAttributeValues: {
        ":name": user.name,
        ":password": user.password,
        ":currentSemester": user.currentSemester
      }
    };

    await dynamoDB.update(params).promise();
    res.status(200).send({ user: removeSensitiveData(user) });
  } catch (e) {
    res.status(400).send(e);
  }
};

const loginUser = async (req, res) => {
  try {
    const user = await findByCredentials(req.body.email, req.body.password);
    const token = await generateAuthToken(user);
    res.status(200).send({ user: removeSensitiveData(user), token });
  } catch (e) {
    console.error(e); // Log the detailed error
    res.status(500).send({ msg: e.message }); // Send the error message in the response
  }
};

const logout = async (req, res) => {
  try {
    const user = await getUserByEmail(req.user.email);

    if (!user) {
      return res.status(404).send({ msg: "User not found" });
    }

    user.tokens = user.tokens.filter((token) => token.token !== req.token);

    const params = {
      TableName: "Users",
      Key: { regdId: user.regdId },
      UpdateExpression: "set tokens = :tokens",
      ExpressionAttributeValues: {
        ":tokens": user.tokens
      }
    };

    await dynamoDB.update(params).promise();
    res.send({ msg: "Logged out successfully" });
  } catch (e) {
    console.error("Logout error:", e); // Log the detailed error
    res.status(500).send({ msg: "Internal Server Error" });
  }
};
const logoutAll = async (req, res) => {
  try {
    const user = await getUserByEmail(req.user.email);
    user.tokens = [];

    const params = {
      TableName: "Users",
      Key: { regdId: user.regdId },
      UpdateExpression: "set tokens = :tokens",
      ExpressionAttributeValues: {
        ":tokens": user.tokens
      }
    };

    await dynamoDB.update(params).promise();
    res.send({ msg: "logged out successfully from all devices" });
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
  updateUser,
  loginUser,
  logout,
  logoutAll,
  userData,
};
