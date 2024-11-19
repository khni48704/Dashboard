const ProjectModel = require('../models/ProjectModel');

exports.getStack = async (req, res) => {
    try {
        const stacks = await ProjectModel.getStack();
        res.render('projects', {stacks});
    } catch(error) {
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