const jwt = require('jsonwebtoken');
const ProjectModel = require('../models/ProjectModel');
const axios = require('axios');

// Funktion til at hente containerens status fra Portainer API
async function getContainerStatus(authToken, containerId) {
    try {
        const containerResponse = await axios.get(`https://portainer.kubelab.dk/api/stacks`, {
            headers: {
                "Authorization": `Bearer ${authToken}`
            }
        });

        console.log("API Response:", containerResponse.data);

        const stack = containerResponse.data.find(stack => stack.Id === containerId);
        console.log(stack, containerId);

        if (stack) {
            console.log("Stack found:", stack);
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
            return res.redirect('/');
        }

        const emailSent = req.session.user.email;
        const stacks = await ProjectModel.getStack(emailSent);

        const authToken = await getAuthToken();
        if (!authToken) {
            console.log('Missing auth-token');
            return res.status(500).send('Missing auth-token');
        }

        for (let stack of stacks) {
            const containerId = stack.portainer_id;
            const containerStatus = await getContainerStatus(authToken, containerId);
            console.log(containerId , "linje58")
            stack.containerStatus = containerStatus;
            console.log(stacks.Id);
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

// Funktion til at oprette stack
exports.createStack = async (req, res) => {
    try {
        const { project_name, url, template_id, group_id } = req.body;

        console.log('Session ved oprettelse af stack:', req.session.user);

        const userId = req.session.user ? req.session.user.user_id : null;
        if (!userId) {
            console.log('Bruger ikke logget ind');
            return res.status(400).send('Bruger ikke logget ind');
        }

        const stacks = await ProjectModel.createStack({
            project_name, 
            url, 
            userId,
            template_id,
            group_id,
            create_date: new Date()
        });

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

        const token = req.session.user.token;
        if (!token) {
            console.log('Manglende JWT-token');
            return res.status(401).send('Manglende JWT-token');
        }

        const authToken = await getAuthToken(); // Hent auth token fra Portainer, ligesom i postman.
        if (!authToken) {
            console.log('Mangler auth-token fra Portainer API');
            return res.status(500).send('Mangler auth-token fra Portainer API');
        }

        const portainerUrl = "https://portainer.kubelab.dk/api/stacks/create/swarm/string";
        try {
            const response = await axios.post(portainerUrl, stackData, {
                params: { endpointId: 5 },
                headers: {
                    "Authorization": `Bearer ${authToken}`,
                    "Content-Type": "application/json"
                }
            });

            console.log("Portainer API-svar:", response.data);
            res.redirect('/projects'); 
        } catch (error) {
            console.error("Fejl fra Portainer API:", error.response ? error.response.data : error.message);
            res.status(500).send('Server Error: Kunne ikke oprette stack.1 ' + (error.response ? error.response.data.message : ''));
        }
    } catch (error) {
        console.log("Fejl i createStack:", error);
        res.status(500).send('Server Error: Kunne ikke oprette stack.2');
    }
};

