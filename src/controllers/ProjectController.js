const ProjectModel = require('../models/ProjectModel');
const PortainerService = require('../services/portainerServices');

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
/*
exports.createStack = async (req, res) => {
    try {
        const {project_name, url} = req.body;
        const stacks = await ProjectModel.createStack({project_name, url});
       // res.redirect('/projects');
    } catch(error) {
        res.status(500).send('Server Error');
    }
}*/

exports.createStack = async (req, res) => {
    try {
        // Validate input
        const { project_name, url, template } = req.body;
        
        if (!project_name || !url || !template) {
            return res.status(400).render('createStack', { 
                error: 'Missing required fields' 
            });
        }

        // Create stack in Portainer and save to database
        await PortainerService.createPortainerStack({
            project_name, 
            url, 
            template
        });

        // Redirect to projects page with success message
        res.redirect('/projects');
    } catch (error) {
        console.error(error);
        // Render createStack view with error
        res.status(500).render('createStack', { 
            error: 'Failed to create project', 
            details: error.message 
        });
    }
};