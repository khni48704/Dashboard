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
    const emailSent = req.query.email;
    console.log(emailSent);
    if (!emailSent) {
        return res.status(400).send('E-mail parameter mangler.');
    }
    res.render('projects', { emailSent })
});

router.get('/createStack', (req, res) => {
    const emailSent = req.query.email;
    console.log(emailSent);
    if (!emailSent) {
        return res.status(400).send('E-mail parameter mangler.');
    }
    res.render('createStack', { emailSent })
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

router.get('/settings', (req, res) => {
    res.render('settings')
})

router.get('/navigation', (req, res) => {
    res.render('navigation')
});

router.get('/changePassword', (req, res) => {
    res.render('changePassword')
});

module.exports = router;