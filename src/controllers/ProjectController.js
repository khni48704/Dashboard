const jwt = require('jsonwebtoken');
const ProjectModel = require('../models/ProjectModel');
const axios = require('axios');

// Hent stack-data
exports.getStack = async (req, res) => {
  try {
      // Tjek om bruger er logget ind
      if (!req.session.user) {
          return res.redirect('/');
      }

      const emailSent = req.session.user.email;
      const stacks = await ProjectModel.getStack(emailSent);
      res.render('projects', { stacks });
  } catch (error) {
      console.error("Fejl:", error);
      res.status(500).send('Server Error');
  }
};

// Hent auth token fra Portainer API
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