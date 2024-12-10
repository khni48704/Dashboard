const express = require('express');
const userController = require('../controllers/UserController');
const projectController = require('../controllers/ProjectController');
const router = express.Router();
const templateController = require('../controllers/TemplateController');
const session = require('express-session');

// Opsætter vores session middleware
router.use(session({
    secret: 'mySecretKey',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Middleware der gør brugerdata tilgængelige i views
router.use((req, res, next) => {

// Hvis brugeren er logget ind, gem brugerdata i res.locals
  if (req.session && req.session.user) {
      res.locals.user = req.session.user;
  } else {
      res.locals.user = null;
  }
    next();
});

// Middleware til at tjekke om brugeren er logget ind
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    next();
};

router.get('/projects', requireAuth, projectController.getStack);
router.get('/layouts/createStack', requireAuth, (req, res) => res.render('createStack'));

//Afslutter session
router.post('/logout', (req, res) => {
    console.log('Logged out of', req.session.user ? req.session.user.email : 'Ingen session');
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Failed to log oud');
        }
        console.log('Session destroyed');
        res.redirect('/');
    });
});

//ruter til brugere og projekter
router.post('/add-user', userController.createUser);
router.post('/login', userController.loginUser);
//router.get('/templates', templateController.getTemplate);


router.get('/stacks', projectController.getStack);
router.post('/add-project', projectController.createStack);

router.post('/delete-project', requireAuth, projectController.deleteStack);

router.post('/changePassword', requireAuth, userController.changePassword);

router.get('/', (req, res) => {
    res.render('layouts/login');
});

router.get('/createAccount', (req, res) => {
    res.render('layouts/createAccount')
});

router.get('/createStack', (req, res) => {
    res.render('layouts/createStack')
});

router.get('/createTemplate', (req, res) => {
    res.render('layouts/createTemplate')
})

router.get('/templates', (req, res) => {
    res.render('layouts/templates')
})

router.get('/groups', (req, res) => {
    res.render('layouts/groups')
})

router.get('/createGroup', (req, res) => {
    res.render('layouts/createGroup')
})

router.get('/settings', (req, res) => {
    res.render('layouts/settings')
})

router.get('/navigation', (req, res) => {
    res.render('navigation')
});

router.get('/changePassword', (req, res) => {
    res.render('layouts/changePassword')
});

module.exports = router;