const db = require('../config/db.js');

//exports gør, at man kan tilgå funktionen i andre filer
//async betyder, at funktionen indeholder aynkron kode
exports.getStack = async () => {
    //await pauser udførelsen af en kode indtil promise er opfyldt
    const [rows, fields] = await db.query('SELECT project_name, subdomain, url FROM Project');
    return rows;
}

exports.createStack = async (stack) => {
    //execute bruges til at sende en SQL-kommando til database (her insert)
    const [result] = await db.execute(`
    INSERT INTO Project
      (project_name, url) 
    VALUES 
      ('${stack.project_name}', '${stack.url}')
    `);
    console.log("det er indsat i project model");
    return result;
  };