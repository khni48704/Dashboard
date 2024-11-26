const ProjectModel = require('../models/ProjectModel');

exports.getStack = async (req, res) => {
    try {
        email = "k.madsen999gmail.com";
        console.log(email);
        let stacks = await ProjectModel.getStack(email);
        res.render('projects', {stacks});
    } catch(error) {
        console.log("fejlmdam");
        res.status(500).send('Server Error'+error);
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