const db = require('../config/db.js');

exports.getStack = async (email) => {
    const query =
        'SELECT Project.project_name, Project.url, Project.create_date, Users.email FROM Project INNER JOIN Users ON Project.user_id = Users.user_id WHERE Users.email = ?';
    const [rows, fields] = await db.query(query, [email]);
    return rows;
}

exports.createStack = async (stack) => {
  const [result] = await db.execute(
    `INSERT INTO Project (project_name, url) VALUES (?, ?)`,
    [stack.project_name, stack.url]
);
    return result;
};