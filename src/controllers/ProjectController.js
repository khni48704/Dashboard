const jwt = require('jsonwebtoken');
const ProjectModel = require('../models/ProjectModel');
const axios = require('axios');

// Funktion til at hente containerens status fra Portainer API
async function getContainerStatus(authToken, containerId) {
    console.log("containerid:",containerId);
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
        console.log("Stacks:", stacks);

        if (!stacks || stacks.lenght === 0) {
            console.log("Ingen stacks fundet for bruger:", emailSent);
            return res.status(404).send("Ingen stacks fundet.");
        }

        console.log("Hentede stacks fra databasen:", stacks);

        const authToken = await getAuthToken();
        if (!authToken) {
            console.log('Missing auth-token');
            return res.status(500).send('Missing auth-token');
        }

        for (let stack of stacks) {
            const containerId = stack.portainer_id;
            console.log(containerId , "linje52")
            const containerStatus = await getContainerStatus(authToken, containerId);
            console.log(containerId , "linje58")
            stack.containerStatus = containerStatus;
            console.log(stacks.Id);

            if (!containerId) {
                console.log(`Stack with ID ${stack.project_name} has no Portainer ID.`);
                stack.containerStatus = 'Unknown';
            } else {
                const containerStatus = await getContainerStatus(authToken, containerId);
                console.log("Container Status for", containerId, "linje58");
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

        const token = req.session.user.token;
        if (!token) {
            console.log('Manglende JWT-token');
            return res.status(401).send('Manglende JWT-token');
        }

        const authToken = await getAuthToken(); // Hent auth token fra Portainer
        if (!authToken) {
            console.log('Mangler auth-token fra Portainer API');
            return res.status(500).send('Mangler auth-token fra Portainer API');
        }

        // Opret stacken på Portainer
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
            template_id,
            group_id,
            create_date: new Date(),
            portainer_id
        });

        res.redirect('/projects'); 
    } catch (error) {
        console.log("Fejl i createStack:", error);
        res.status(500).send('Server Error: Kunne ikke oprette stack.');
    }
};

// SAVE THEME
exports.setTheme = (req, res) => {
    const theme = req.body.theme; // Assuming the theme is sent via a POST request
    if (theme === 'dark-mode' || theme === 'light-mode') {
        req.session.theme = theme; // Save the theme in the session
        res.status(200).json({ message: 'Theme updated successfully', theme });
    } else {
        res.status(400).json({ message: 'Invalid theme' });
    }
};

