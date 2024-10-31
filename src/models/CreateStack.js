const db = require('../config/db.js');

//exports gør, at man kan tilgå funktionen i andre filer
//async betyder, at funktionen indeholder aynkron kode
exports.getStack = async () => {
    //await pauser udførelsen af en kode indtil promise er opfyldt
    const [rows, fields] = await db.query('SELECT project_name, subdomain, url, user_id, id FROM Project');
    return rows;
}

exports.createStack = async (stack) => {
    //execute bruges til at sende en SQL-kommando til database (her insert)
    const [result] = await db.execute(`
    INSERT INTO Users 
      (project_name, subdomain, url, user_id) 
    VALUES 
      ('${stack.project_name}', '${stack.subdomain}', '${stack.url}', '${stack.user_id}')
    `);
    return result;
  };