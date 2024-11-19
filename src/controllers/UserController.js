const UserModel = require('../models/UserModel');

exports.getUsers = async (req, res) => {
    try {
        const users = await UserModel.getUsers();
        res.render('index', { users });
    } catch(error) {
        res.status(500).send('Server Error');
    }
};

exports.createUser = async (req, res) => {
    try {
        const {first_name, last_name, email, password} = req.body;
        const users = await UserModel.createUser({first_name, last_name, email, password});
        res.redirect('/projects');
    } catch(error) {
        res.status(500).send('Server Error');
    }
};

//Login og konsolog ok, hvis bruger eksitere i db
exports.loginUser = async (req, res) => {
  try {
    let email = req.body.email;
    let password = req.body.password;
    console.log(email);
    const user = await UserModel.findUserByEmailAndPassword(email, password);
    if (user) {
      console.log("OK");
      res.status(200).json({ message: `Velkommen ${email}` });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
    res.redirect('/projects');
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
};