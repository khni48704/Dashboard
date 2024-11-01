// Folder structure
//  project/
//  - views/
//      - home.hbs


const express = require('express');
const path = require('node:path');
const app = express();
const bodyParser = require('body-parser');
const webRoutes = require('./src/routes/web');
const URL = process.env.URL || '0.0.0.0';
const PORT = process.env.PORT || 3200;

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));


app.use('/', webRoutes);


app.listen(PORT, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log(`Server is running on port ${PORT}`);
    }
});




/*
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
    fetch("https://portainer.kubelab.dk/api/system/status", {
        method: "GET"
    })
    .then((res) => {
        console.log(res);
        if (!res.ok) {
            throw new Error("Netværksrespons ikke ok");
        }
        return res.json();
    })/*
    .then((data) => {
        console.log(data);

        // Indsæt data i HTML-liste
        const datalist = document.getElementById('data-list');
        datalist.innerHTML = ""; 
        data.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = item.Name; 
            datalist.appendChild(listItem);
        });
    })*//*
    .catch((err) => {
        console.error("Fejl: ", err);
    });
};

getPostmanData();*/
/*

// Define a route to render a template
app.get('/', (req, res) => {
    res.render('index', data);
});


// Define a route to render a template
app.get('/ProjectDetails', (req, res) => {
    res.render('ProjectDetails', data);
});

app.get('/styles.css', (req, res) => {
    res.type('text/css');
    res.sendFile(path.join(__dirname, 'styles.css'));
});*/