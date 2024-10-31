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