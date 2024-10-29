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

const getPostmanData = () => {
    fetch("http://tasks.portainer_agent:9001", { // Prøv at ændre til HTTP, hvis muligt
        method: "GET"
    })
    .then((res) => {
        if (!res.ok) {
            throw new Error("Netværksrespons ikke ok");
        }
        return res.json();
    })
    .then((data) => {
        console.log(data);
        arrangementer.value = data;

        const datalist = document.getElementById('data-list');
        datalist.innerHTML = ""; 
        data.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = item.Name; 
            datalist.appendChild(listItem);
        });
    })
    .catch((err) => {
        console.log(err);
        error.value = "Kunne ikke hente data";
    });
};
// Kald funktionen for at hente data
getPostmanData();


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