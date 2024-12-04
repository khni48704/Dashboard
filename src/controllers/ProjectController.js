const jwt = require('jsonwebtoken');
const ProjectModel = require('../models/ProjectModel');
const axios = require('axios');

// Funktion til at hente containerens status fra Portainer API
async function getContainerStatus(authToken, containerId) {
    //console.log("containerid:",containerId);
    try {
        const containerResponse = await axios.get(`https://portainer.kubelab.dk/api/stacks`, {
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        });

        //console.log("API Response:", containerResponse.data);

        const stack = containerResponse.data.find(stack => stack.Id === containerId);
        //console.log(stack, containerId);

        if (stack) {
            //console.log("Stack found:", stack);
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

exports.getStack = async (req, res) => {
    try {
        if (!req.session.user) {
            console.log("user not logged");
            return res.redirect('/');
        }

        const emailSent = req.session.user.email;
        console.log("User email:", emailSent);
        const stacks = await ProjectModel.getStack(emailSent);
        //console.log("Stacks:", stacks);

        if (!stacks || stacks.lenght === 0) {
            console.log("Ingen stacks fundet for bruger:", emailSent);
            return res.status(404).send("Ingen stacks fundet.");
        }

        //console.log("Hentede stacks fra databasen:", stacks);

        const authToken = await getAuthToken();
        if (!authToken) {
            console.log('Missing auth-token');
            return res.status(500).send('Missing auth-token');
        }

        for (let stack of stacks) {
            const containerId = stack.portainer_id;
            //const containerStatus = await getContainerStatus(authToken, containerId);
            //stack.containerStatus = containerStatus;
            //console.log(stacks.Id);

            if (!containerId) {
                console.log(`Stack with ID ${stack.project_name} has no Portainer ID.`);
                stack.containerStatus = 'Unknown';
            } else {
                const containerStatus = await getContainerStatus(authToken, containerId);
                //console.log("Container Status for", containerId, "linje58");
                stack.containerStatus = containerStatus;
            }
        }

        res.render('projects', {
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
        console.error("Error:", error);
        res.status(500).send('Server Error');
    }
};

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


exports.deleteStack = async (req, res) => {
    try {
        const project_id = req.body.project_id;
        const userId = req.session.user.user_id;
        console.log("User ID:", userId);
        console.log("Project ID:", project_id);

        // Få portainer_id fra din database for dette projekt
        const project = await ProjectModel.getProjectById(project_id, userId);
        if (!project) {
            return res.status(404).send("Project not found or permission denied.");
        }

        const portainer_id = project.portainer_id;
        console.log("Portainer ID:", portainer_id);

        const authToken = await getAuthToken();
        if (!authToken) {
            console.log('Missing auth-token');
            return res.status(500).send('Missing auth-token');
        }

        const endpointUrl = `https://portainer.kubelab.dk/api/stacks/${portainer_id}?endpointId=5`;

        try {
            const portainerResponse = await axios.delete(endpointUrl, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            console.log("Portainer API response:", portainerResponse.data);
            console.log(`Portainer stack with ID ${portainer_id} has now been deleted.`);
        } catch (portainerError) {
            console.error("Error deleting stack from Portainer:", portainerError.response?.data || portainerError.message);
            return res.status(500).send("Error deleting stack from Portainer.");
        }

        const result = await ProjectModel.deleteStack(project_id, userId, portainer_id);

        if (result.affectedRows === 0) {
            return res.status(404).send("Project not found or permission denied.");
        }

   
        console.log(`Project with ID ${project_id} has now been deleted from the database.`);

        res.redirect('/projects');
    } catch (error) {
        console.error("Error deleting project:", error.message);
        console.error("Stack trace:", error.stack);
        res.status(500).send("Error deleting project.");
    }
};


exports.createStack = async (req, res) => {
    try {
        const { project_name, url, template_id, group_id } = req.body;

        const templateIdFound = await ProjectModel.getTemplate(template_id);
        const groupIdFound = await ProjectModel.getGroup(group_id);

        console.log('Session ved oprettelse af stack:', req.session.user);

        const userId = req.session.user ? req.session.user.user_id : null;
        if (!userId) {
            console.log('Bruger ikke logget ind');
            return res.status(400).send('Bruger ikke logget ind');
        }

        const token = req.session.user.token;
        if (!token) {
            console.log('Manglende JWT-token');
            return res.status(401).send('Manglende JWT-token');
        }

        const authToken = await getAuthToken();
        if (!authToken) {
            console.log('Mangler auth-token fra Portainer API');
            return res.status(500).send('Mangler auth-token fra Portainer API');
        }

        const stackData = {
            fromTemplate: false,
            name: project_name,
            stackFileContent: `{
                "networks": {
                    "traefik-proxy": {
                        "external": true
                    }
                },
                "services": {
                    "test": {
                        "image": "nginx:latest",
                        "networks": ["traefik-proxy"],
                        "deploy": {
                            "labels": [
                                "traefik.enable=true",
                                "traefik.http.routers.dashboard.rule=Host(\`\${url}\`)",
                                "traefik.http.routers.dashboard.entrypoints=web,websecure",
                                "traefik.http.routers.dashboard.tls.certresolver=letsencrypt",
                                "traefik.http.services.dashboard.loadbalancer.server.port=80"
                            ]
                        }
                    }
                }
            }`,
            swarmId: "v1pkdou24tzjtncewxhvpmjms"
        };

        const portainerUrl = "https://portainer.kubelab.dk/api/stacks/create/swarm/string";
        const response = await axios.post(portainerUrl, stackData, {
            params: { endpointId: 5 },
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json"
            }
        });

        console.log("Portainer API-svar:", response.data);

        // Gem stack i din database og brug portainer_id
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
        console.log("Fejl i createStack:", error);
        res.status(500).send('Server Error: Kunne ikke oprette stack.');
    }
};