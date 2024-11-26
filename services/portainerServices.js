const axios = require('axios');
const ProjectModel = require('../models/ProjectModel');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwidXNlcm5hbWUiOiJrb2RlZ2VuaSIsInJvbGUiOjIsInNjb3BlIjoiZGVmYXVsdCIsImZvcmNlQ2hhbmdlUGFzc3dvcmQiOmZhbHNlLCJleHAiOjE3MzI2NDkzOTAsImlhdCI6MTczMjYyMDU5MCwianRpIjoiOGE4MTJmYTMtMDI2Zi00ZGYzLWFkYTctYTAyOTUxYzI1ZTZkIn0.4r2jSaNYbR-D8jCvAHl6NRXuyUTipNeTs7jaYqBPeZQ";

class PortainerService {
    // Constants (consider moving to environment variables)
    static SWARM_ID = 'v1pkdou24tzjtncewxhvpmjms';
    static ENDPOINT_ID = 5;

    /**
     * Generate Docker Compose YAML based on template type
     * @param {string} url - Subdomain for the project
     * @param {string} template - Type of template to generate
     * @returns {string} Docker Compose YAML string
     */
    static generateComposeYaml(url, template) {
        // Randomizer for unique IDs
        const websiteId = Math.random().toString(36).substring(7);
        const pmaId = Math.random().toString(36).substring(7);

        switch(template) {
            case 'wordpress':
                return `networks:
  traefik-proxy:
    external: true
  wp-network:
    driver: overlay
services:
  wordpress:
    image: wordpress:latest
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: wpuser
      WORDPRESS_DB_PASSWORD: wppassword
      WORDPRESS_DB_NAME: wpdatabase
    networks:
      - traefik-proxy
      - wp-network
    deploy:
      labels:
        - traefik.enable=true
        - traefik.http.routers.${websiteId}.rule=Host(\`${url}.kubelab.dk\`)
        - traefik.http.routers.${websiteId}.entrypoints=web,websecure
        - traefik.http.routers.${websiteId}.tls.certresolver=letsencrypt
        - traefik.http.services.${websiteId}.loadbalancer.server.port=80
  db:
    image: mariadb:latest
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: wpdatabase
      MYSQL_USER: wpuser
      MYSQL_PASSWORD: wppassword
    networks:
      - wp-network
  phpmyadmin:
    image: phpmyadmin:latest
    environment:
      PMA_HOST: db
      PMA_USER: wpuser
      PMA_PASSWORD: wppassword
    networks:
      - traefik-proxy
      - wp-network
    deploy:
      labels:
        - traefik.enable=true
        - traefik.http.routers.${pmaId}.rule=Host(\`${url}-pm.kubelab.dk\`)
        - traefik.http.routers.${pmaId}.entrypoints=web,websecure
        - traefik.http.routers.${pmaId}.tls.certresolver=letsencrypt
        - traefik.http.services.${pmaId}.loadbalancer.server.port=80`;
            
            default:
                throw new Error('Invalid template type');
        }
    }

    /**
     * Create a stack in Portainer and save to database
     * @param {Object} projectDetails 
     * @returns {Promise} Created stack details
     */
    static async createPortainerStack(projectDetails) {
        const { project_name, url, template } = projectDetails;

        // Generate Compose YAML
        const body = this.generateComposeYaml(url, template);

        // Prepare payload for Portainer
        const payload = {
            swarmId: this.SWARM_ID,
            endpointId: this.ENDPOINT_ID,
            title: project_name,
            body,
            userId: 1 // TODO: Replace with actual user ID
        };

        try {
            // Make API call to Portainer 
            const portainerResponse = await axios.post(
                'https://portainer.kubelab.dk/api/stacks', 
                payload, 
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Save project to database
            const dbResult = await ProjectModel.createStack({
                project_name, 
                url
            });

            return {
                portainer: portainerResponse.data,
                database: dbResult
            };
        } catch (error) {
            console.error('Error creating Portainer stack:', error);
            throw error;
        }
    }

    /**
     * Additional Portainer-related methods can be added here
     * e.g., listStacks, deleteStack, updateStack, etc.
     */
}

module.exports = PortainerService;