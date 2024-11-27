const ProjectModel = require('../models/ProjectModel');
const axios = require('axios');

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
/* exports.getStack = async (req, res) => {
  try {
    //finder emailen gennem query parameteret
      const emailSent = req.query.email;
      if (!emailSent) {
          return res.status(400).send('E-mail ikke fundet');
      }
      let stacks = await ProjectModel.getStack(emailSent);
      res.render('projects', { stacks });
  } catch (error) {
      console.log("Fejl", error);
      res.status(500).send('Server Error' + error);
  }
};
*/
// Opret stack og opret stack i Portainer
exports.createStack = async (req, res) => {
  try {
      const { project_name, url } = req.body;

      const stacks = await ProjectModel.createStack({ project_name, url });

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
                              "traefik.http.routers.dashboard.rule=Host(\`\${url}\`)", // Sørg for at interpolate url korrekt
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
      const endpointId = 5;
      const token = "<your-jwt-token>"; // Skal have lavet en funktion eller lign her til JWT token

      const response = await axios.post(portainerUrl, stackData, {
          params: { endpointId },
          headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
          }
      });

      res.redirect('/projects');
  } catch (error) {
      console.log("Fejl i createStack", error);
      res.status(500).send('Server Error: Kunne ikke oprette stack.');
  }
};
