const e = require('express');
const UserModel = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const key = 'key';

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

exports.loginUser = async (req, res) => {
  try {
      const { email, password } = req.body;
      console.log('Login forsøg:', { email, password });

      const user = await UserModel.findUserByEmailAndPassword(email, password);
      if (user) {
          // Generer JWT-token
          const token = jwt.sign(
              { id: user.user_id, email: user.email },
              key, 
              { expiresIn: '1h' }
          );

          // Gem brugerens id, email og token i sessionen
          req.session.user = { user_id: user.user_id, email: user.email, token: token };
          console.log('Session oprettet:', req.session.user);  // Log sessionen her

          return res.redirect('/projects');
      } else {
          res.status(401).render('index', { error: "Ugyldig email eller password" });
      }
  } catch (error) {
      console.error(error);
      res.status(500).render('index', { error: 'Server error' });
  }
};