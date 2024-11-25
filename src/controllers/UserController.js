const UserModel = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const key = 'key';

let jwtUser;



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
      console.log('Logget ind via:', { email, password });

      const user = await UserModel.findUserByEmailAndPassword(email, password);
      if (user) {
        const token = jwt.sign(
            {id: user.id, email: user.email},
            key,
            {expiresIn: '5m'}
        );
        console.log(token);
        return res.json({ token });
          //res.redirect('/projects');
      } else {
          //res.status(401).json({ message: "Invalid email or password" });
          res.render('index', { error: "Invalid email or password" });
      }
  } catch (error) {
      console.error(error);
      //res.status(500).send('Server Error');
      res.status(500).render('index', { error: 'Server Error. Prøv igen senere.' });
  }
};

