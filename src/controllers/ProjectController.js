const ProjectModel = require('../models/ProjectModel');
//et library der håndtere HHTP request fra både browser og node.js environments
const axios = require('axios');
const moment = require('moment');

// Funktion til at hente containerens status fra Portainer API
async function getContainerStatus(authToken, containerId) {
    try {
        const containerResponse = await axios.get(`https://portainer.kubelab.dk/api/stacks`, {
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        });

        const stack = containerResponse.data.find(stack => stack.Id === containerId);

        if (stack) {
            if (stack.Status === 1) {
                return 'Running';
            }
            return stack.Status;
        } else {
            console.warn(`No stack found with ID ${containerId}`);
            return 'Unknown';
        }
    } catch (error) {
        console.error(`Error fetching container status for ID ${containerId}:`, error.response?.data || error.message);
        return 'Error';
    }
}

function getInitials(email) {
    const initials = email.split('@')[0];
    return initials;
}

//Funktion til at hente stacks fra databasen og API'et
exports.getStack = async (req, res) => {
    console.log(req.session.user.email);
    console.log("her er get stacks");
    try {
        if (!req.session.user) {
            console.log('session user');
            return res.redirect('/login');
        }

        //Finder brugerens email fra den session, der er
        const emailSent = req.session.user.email;
        console.log("User email:", emailSent);

        const stacks = await ProjectModel.getStack(emailSent);
        console.log(stacks);
        if (!stacks || stacks.lenght === 0) {
            return res.status(404).send("No stacks found");
        }

        //Henter JWT token fra session
        const authToken = await getAuthToken();
        if (!authToken) {
            return res.status(500).send('Missing auth-token');
        }

        const userInitials = getInitials(emailSent);
        //loop over stacks en bruger har
        for (let stack of stacks) {
            const containerId = stack.portainer_id;
            stack.create_date = moment(stack.create_date).format('DD-MM-YYYY');
            stack.userInitials = userInitials;

            if (!containerId) {
                console.log(`Stack with ID ${stack.project_name} has no Portainer ID.`);
                stack.containerStatus = 'Unknown';
            } else {
                const containerStatus = await getContainerStatus(authToken, containerId);
                stack.containerStatus = containerStatus;
            }
        }

        //Viser navn, efternavn og email på den bruger, som er logget ind
        res.render('layouts/projects', {
            stacks,
            navigation: {
                user: {
                    first_name: req.session.user.first_name,
                    last_name: req.session.user.last_name,
                    email: req.session.user.email
                }
            }
        });
    } catch (error) {
        res.status(500).send('Server Error');
    }
};

//Log ind til portainer gennem auth
async function getAuthToken() {
    try {
        const response = await axios.post('https://portainer.kubelab.dk/api/auth', {
            username: 'kodegeni',
            password: 'Kodegeni4'
        });

        console.log('Auth Token:', response.data.jwt);
        return response.data.jwt;
    } catch (error) {
        console.error('Fejl ved hentning af auth-token:', error.message);
        return null;
    }
}

//Funktion til at slette et projekt
exports.deleteStack = async (req, res) => {
    try {
        const project_id = req.body.project_id;
        const userId = req.session.user.user_id;

        // Få portainer_id fra brugerens database for dette projekt
        const project = await ProjectModel.getProjectById(project_id, userId);
        if (!project) {
            return res.status(404).send("Project not found");
        }

        //det id der er på et projekt i portainer
        const portainer_id = project.portainer_id;

        //Henter JWT token fra session
        const authToken = await getAuthToken();
        if (!authToken) {
            return res.status(500).send('Missing auth-token');
        }

        //et API kald, som sletter et projekt ud fra id'et, der er på et projekt i portainer
        const endpointUrl = `https://portainer.kubelab.dk/api/stacks/${portainer_id}?endpointId=5`;

        try {
            const portainerResponse = await axios.delete(endpointUrl, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            console.log(`Project with portainer ID ${portainer_id} has been deleted`);
        } catch (portainerError) {
            return res.status(500).send("Error deleting stack from Portainer");
        }

        const result = await ProjectModel.deleteStack(project_id, userId, portainer_id);

        if (result.affectedRows === 0) {
            return res.status(404).send("Project not found");
        }
        res.redirect('/projects');
    } catch (error) {
        res.status(500).send("Error deleting project in either database or portainer");
    }
};

//Funktion til at lave et projekt
exports.createStack = async (req, res) => {
    try {
        const { project_name, url, template_id, group_id } = req.body;

        const templateIdFound = await ProjectModel.getTemplate(template_id);
        const templateContentFound = await ProjectModel.getContent(template_id);
        const groupIdFound = await ProjectModel.getGroup(group_id);

        console.log('Session ved oprettelse af stack:', req.session.user);

        const userId = req.session.user ? req.session.user.user_id : null;
        if (!userId) {
            return res.status(400).send('Bruger ikke logget ind');
        }

        const token = req.session.user.token;
        if (!token) {
            return res.status(401).send('Manglende JWT-token');
        }

        const authToken = await getAuthToken();
        if (!authToken) {
            return res.status(500).send('Mangler auth-token fra Portainer API');
        }

         //laver random tekst til CHANGEME og SUBDOMAIN02
         function randomChangeMe(length) {
            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            let result = "";
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            console.log(result);
            return result;
        }

        var randomChangeMe00 = randomChangeMe(15);
        var randomChangeMe01 = randomChangeMe(15);
        var randomChangeMe02 = randomChangeMe(15);
        var randomSubdomain = randomChangeMe(15);

        let templateContent = templateContentFound;

        //wordpress
        templateContent = templateContent.replaceAll("CHANGEME01", randomChangeMe01);
        templateContent = templateContent.replaceAll("CHANGEME02", randomChangeMe02);
        templateContent = templateContent.replaceAll("SUBDOMAIN01", url);
        templateContent = templateContent.replaceAll("SUBDOMAIN02", randomSubdomain);

        //nginx
        templateContent = templateContent.replaceAll("CHANGEME", randomChangeMe00);
        templateContent = templateContent.replaceAll("SUBDOMAIN", url);
        

        console.log(templateContent);
     
        //API kald til at oprette et projekt
        const portainerUrl = "https://portainer.kubelab.dk/api/stacks/create/swarm/string";
        stackData = {
            name: project_name,
            stackFileContent: templateContent,
            endpointId: 5,
            swarmId: "v1pkdou24tzjtncewxhvpmjms"
        }

        const response = await axios.post(portainerUrl, stackData, {
            params: { endpointId: 5 },
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json"
            }
        });

        console.log("Portainer API-svar:", response.data);

        // Gem stack i brugerens database og brug portainer_id
        const portainer_id = response.data.Id; // Dette er Portainer ID'et for den nye stack
        const stacks = await ProjectModel.createStack({
            project_name,
            url,
            userId,
            template_id: templateIdFound,
            group_id: groupIdFound,
            create_date: new Date(),
            portainer_id
        });

        res.redirect('/projects'); 
    } catch (error) {
        console.log(error);
        res.status(500).send('Error from creating template');
    }
};