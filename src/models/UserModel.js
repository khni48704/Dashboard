const db = require('../config/db.js');

//exports gør, at man kan tilgå funktionen i andre filer
//async betyder, at funktionen indeholder aynkron kode
exports.getUsers = async () => {
    //await pauser udførelsen af en kode indtil promise er opfyldt
    const [rows, fields] = await db.query('SELECT first_name, last_name, email, password, user_id FROM Users');
    return rows;
}

exports.getGroupForUser = async (group_name) => {
  const [rows] = await db.execute(
      `SELECT group_id FROM  \`Group\` WHERE group_name = ?`,
      [group_name]
  );
  return rows[0].group_id;
}


exports.createUser = async (user) => {
    //execute bruges til at sende en SQL-kommando til database (her insert)
    const [result] = await db.execute(`
    INSERT INTO Users 
      (first_name, last_name, email, password, group_id) 
    VALUES 
      (?, ?, ?, ?, ?)
    `,
    [
      user.first_name,
      user.last_name,
      user.email,
      user.password,
      user.group_id
    ]
    );
    return result;
  };
  

/* Nye kode finder bruger på email og password*/
exports.findUserByEmailAndPassword = async (email, password) => {
  const [rows] = await db.query('SELECT * FROM Users WHERE email = ? AND password = ?', [email, password]);
  console.log('Database response:', rows);
  if (rows.length > 0) {
      return rows[0];
  }
  return null;
};

