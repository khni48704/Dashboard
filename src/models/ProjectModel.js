const db = require('../config/db.js');

exports.getStack = async (email) => {
    const [rows] = await db.query(
        `SELECT 
            Project.project_id,   
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

exports.getTemplate = async (template) => {
    const [rows] = await db.execute(
        `SELECT template_id FROM Template WHERE template = ?`,
        [template]
    );
    return rows[0].template_id;
}

exports.getGroup = async (group_name) => {
    const [rows] = await db.execute(
        `SELECT group_id FROM  \`Group\` WHERE group_name = ?`,
        [group_name]
    );
    return rows[0].group_id;
}

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

exports.deleteStack = async (project_id, userId) => {
    try {
        // Delete the project by project_id and user_id to ensure the user can only delete their own projects
        const [result] = await db.execute(
            `DELETE FROM Project WHERE project_id = ? AND user_id = ?`, 
            [project_id, userId]
        );
        return result;
    } catch (error) {
        console.error("Error deleting project:", error);
        throw new Error("Error deleting project from database");
    }
};