const db = require('../config/db.js');

exports.getStack = async () => {
    const [rows, fields] = await db.query('SELECT project_name, url, create_date FROM Project');
    return rows;
}

exports.createStack = async (stack) => {
  const [result] = await db.execute(
    `INSERT INTO Project (project_name, url) VALUES (?, ?)`,
    [stack.project_name, stack.url]
);
    return result;
};