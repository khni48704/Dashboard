const TemplateModel = require('../models/TemplateModel');

exports.getTemplate = async (req, res) => {
    try {
        const templates = await TemplateModel.getTemplates();
        console.log("templates:", templates)
        res.render('layouts/templates', { templates });
    } catch (error) {
        console.log(error);
    }
}

exports.createTemplate = async (req, res) => {
    try {
        const { template, content } = req.body;

        const templateCreated = await TemplateModel.createTemplate({
            template,
            content
        });
        res.redirect('/templates'); 
} catch (error) {
    console.log(error);
    res.status(500).send('Server Error: Kunne ikke oprette stack.');
};
}