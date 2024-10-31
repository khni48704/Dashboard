const mysql = require('mysql2');

const pool = mysql.createPool( {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'Dashboard'
});

module.exports = pool.promise();