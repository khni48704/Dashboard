const db = require('../config/db.js');

//Henter projekter fra databasen ud fra SQL
exports.getStack = async (email) => {
    const [rows] = await db.query(
        `SELECT 
            Project.project_id,   
            Project.portainer_id,
            Project.project_name, 
            Project.url, 
            Project.create_date, 
            Users.email, 
            Users.first_name, 
            Users.last_name, 
            Project.portainer_id,
            Users.group_id,
            Template.template,
            \`Group\`.group_name
         FROM 
            Project 
         INNER JOIN 
            Users 
         ON 
            Project.user_id = Users.user_id 
        INNER JOIN
            Template
        ON
            Project.template_id = Template.template_id
        INNER JOIN
            \`Group\`
        ON
            Project.group_id = \`Group\`.group_id
        WHERE 
            Users.email = ?`,
        [email]
    );
    return rows;
};

//Henter template navne fra databasen
exports.getTemplate = async (template) => {
    const [rows] = await db.execute(
        `SELECT template_id FROM Template WHERE template = ?`,
        [template]
    );
    return rows[0].template_id;
}

//Henter gruppe navne fra databasen
exports.getGroup = async (group_name) => {
    const [rows] = await db.execute(
        `SELECT group_id FROM  \`Group\` WHERE group_name = ?`,
        [group_name]
    );
    return rows[0].group_id;
}

//Opretter en stack i databasen ved brug af SQL
exports.createStack = async (stack) => {
    const [result] = await db.execute(
        `INSERT INTO Project (project_name, url, user_id, project_id, template_id, create_date, group_id, portainer_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
        [
            stack.project_name,           
            stack.url,                   
            stack.userId,                
            stack.project_id || null,
            stack.template_id || null, 
            new Date(),
            stack.group_id || null,
            stack.portainer_id || null
        ]
    );
    return result;
};

//Finder et projekt ud fra dets ID
exports.getProjectById = async (project_id, userId) => {
    const [rows] = await db.execute(
        `SELECT * FROM Project WHERE project_id = ? AND user_id = ?`,
        [project_id, userId]
    );
    return rows[0]; // Returner første (eller ingen) række
};

//Sletter en stack ud fra projektets og brugerens ID
exports.deleteStack = async (project_id, userId, portainer_id) => {
    try {
        // Slet projektet fra databasen
        const [result] = await db.execute(
            `DELETE FROM Project WHERE project_id = ? AND user_id = ? AND portainer_id = ?`, 
            [project_id, userId, portainer_id]
        );
        return result;
    } catch (error) {
        throw new Error("Error deleting project from your database");
    }
};