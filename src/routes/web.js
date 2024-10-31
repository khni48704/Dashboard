const express = require('express');
const userController = require('../controllers/UserController');

const router = express.Router();

router.get('/users', userController.getUsers);
router.post('/add-user', userController.createUser);

router.get('/', (req, res) => {
    res.render('index.hbs'); // Sørg for at der er en 'index.hbs' skabelon i views-mappen
});

router.get('/createAccount', (req, res) => {
    res.render('createAccount')
});

router.get('/projects', (req, res) => {
    res.render('projects')
});

router.get('/createStack', (req, res) => {
    res.render('createStack')
});

module.exports = router;