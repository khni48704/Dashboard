// Folder structure
//  project/
//  - views/
//      - home.hbs


const express = require('express');
const app = express();
const PORT = process.env.PORT || 3200;

app.set('view engine', 'hbs');

const data = {
    projektInfomation: [
        {
            projektname: 'Projekt_1', //projekt name, subdomain osv er data der skal trækkes fra databasen og forbindes hertil og så blive sat ind i placeholder i hbs fil
            subdomain: 'hej123', //hej 123 er placeholder og skal erstattes med data fra databasen ud fra den bruger det er osv...
            mail: 'example@mail.com',
            template_type: 'Template A',
            created_date: '2024-10-23',
            status: 'Active'
        }
    ]
};
    

// Define a route to render a template
app.get('/', (req, res) => {
    res.render('ProjectDetails', data);
});

app.listen(PORT, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log(`Server is running on port ${PORT}`);
    }
});