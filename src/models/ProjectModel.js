const db = require('../config/db.js');

exports.getStack = async (email) => {
    const [rows] = await db.query(
        `SELECT 
            Project.project_name, 
            Project.url, 
            Project.create_date, 
            Users.email, 
            Users.first_name, 
            Users.last_name, 
            Project.portainer_id,
            Users.group_id,
            Project.template_id
         FROM 
            Project 
         INNER JOIN 
            Users 
         ON 
            Project.user_id = Users.user_id 
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