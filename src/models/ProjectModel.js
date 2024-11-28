const db = require('../config/db.js');

exports.getStack = async (email) => {
    const [rows] = await db.query(
        'SELECT Project.project_name, Project.url, Project.create_date, Users.email FROM Project INNER JOIN Users ON Project.user_id = Users.user_id WHERE Users.email = ?',
        [email]
    );
    return rows;
};

exports.createStack = async (stack) => {
    const [result] = await db.execute(
        `INSERT INTO Project (project_name, url, user_id, project_id, template_id, create_date, group_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`, 
        [
            stack.project_name,           
            stack.url,                   
            stack.userId,                
            stack.projectId || null,
            stack.templateId || null, 
            new Date(),
            stack.groupId || null
        ]
    );
    return result;
};