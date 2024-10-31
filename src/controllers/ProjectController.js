const ProjectModel = require('../models/ProjectModel');

exports.getStack = async (req, res) => {
    try {
        const stacks = await ProjectModel.getStack();
        res.render('createStack', {stacks});
    } catch(error) {
        res.status(500).send('Server Error');
    }
}

exports.createStack = async (req, res) => {
    console.log("den kører createstack");
    try {
        console.log("den er i try");
        const {project_name, url} = req.body;
        console.log("den er under const");
        const stacks = await ProjectModel.createStack({project_name, url});
        console.log("den har hentet createstack");
        res.redirect('/projects');
        console.log("den er på projects");
    } catch(error) {
        res.status(500).send('Server Error');
    }
}