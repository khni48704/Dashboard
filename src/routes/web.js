const express = require('express');
const userController = require('../controllers/UserController');
const projectController = require('../controllers/ProjectController');

const router = express.Router();

router.get('/users', userController.getUsers);
router.post('/add-user', userController.createUser);
router.post('/login', userController.loginUser); //ny linje slet hvis ikke virker

router.get('/stacks', projectController.getStack);
router.post('/add-project', projectController.createStack); 
router.get('/projects', projectController.getStack);



router.get('/', (req, res) => {
    res.render('index.hbs');
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

router.get('/createTemplate', (req, res) => {
    res.render('createTemplate')
})

router.get('/templates', (req, res) => {
    res.render('templates')
})

router.get('/groups', (req, res) => {
    res.render('groups')
})

router.get('/createGroup', (req, res) => {
    res.render('createGroup')
})

router.get('/user', (req, res) => {
    res.render('user')
})

router.get('/navigation', (req, res) => {
    res.render('navigation')

router.post('/add-project', stackController.createStack)
});

module.exports = router;