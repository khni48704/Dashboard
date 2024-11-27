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
            
        /*fetch(
              "https://portainer.kubelab.dk/api/stacks/create/swarm/string?endpointId=5",
              {
                method: "POST",
              }
            )
              .then((res) => res.json())
              .then((res) => {
                console.log(res);
              })
              .catch((err) => {
                console.log(err);
              });*/
       // res.redirect('/projects');
    } catch(error) {
        res.status(500).send('Server Error');
    }
}