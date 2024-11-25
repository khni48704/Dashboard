const ProjectModel = require('../models/ProjectModel');

exports.getStack = async (req, res) => {
    try {
        const email = req.headers['x-user-email'];
        if (!email) {
            return res.status(401).send('Bruger ikke logget ind');
        }
        const stacks = await ProjectModel.getStack(email);
        res.render('projects', {stacks});
    } catch(error) {
        console.log("fejl");
        res.status(500).send('Server Error');
    }
}

exports.createStack = async (req, res) => {
    try {
        const {project_name, url} = req.body;
        const stacks = await ProjectModel.createStack({project_name, url});
       // res.redirect('/projects');
    } catch(error) {
        res.status(500).send('Server Error');
    }
}