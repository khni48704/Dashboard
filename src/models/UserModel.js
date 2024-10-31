const db = require('../config/db.js');

//exports gør, at man kan tilgå funktionen i andre filer
//async betyder, at funktionen indeholder aynkron kode
exports.getUsers = async () => {
    //await pauser udførelsen af en kode indtil promise er opfyldt
    const [rows, fields] = await db.query('SELECT name, email, id FROM Users');
    return rows;
}

exports.createUser = async (user) => {
    //execute bruges til at sende en SQL-kommando til database (her insert)
    const [result] = await db.execute(`
    INSERT INTO Users 
      (email, password) 
    VALUES 
      ('${user.email}', '${user.password}')
    `);
    return result;
  };