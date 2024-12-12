const db = require('../config/db.js');

exports.getTemplates = async () => {
    const [rows, fields] = await db.query('SELECT template, content FROM Template');
    console.log(rows);
    return rows;
}

exports.createTemplate = async (template) => {
    const [result] = await db.execute(
        `INSERT INTO Template (template, content) 
        VALUES (?, ?)`, 
        [
            template.template,
            template.content
        ]
    );
    return result;
};