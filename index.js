const express = require('express'); //Framework til node.js - er installeret gennem NPM install express
const path = require('node:path'); //Modul fra Node.js, som gør det muligt at manipulere med fil- og stier
const app = express(); //Anvendes sammen med express til at definere ruter, håndtere middleware og lytte efter HTTP-anmodninger
const bodyParser = require('body-parser'); //Middleware for node.js som parser indkommende anmodninger og gør dem tilgængelige som et objekt i req-body
const webRoutes = require('./src/routes/web'); //Så web.js kan bruges
const PORT = process.env.PORT || 3200; //Definerer porten som applikationen kører på
const exphbs = require('express-handlebars'); //Library med templates - er installeret med NPM install express-handlebars
const jwt = require('jsonwebtoken'); //JWT token - er installeret med NPM install jsonwebtoken

//Gør så vi skriver .hbs på handlebars filerne
app.engine('hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: false
}))

//Fortæller xpress-applikationen, at den skal bruge handlebars
app.set('view engine', 'hbs');

//Fortæller at hbs filerne ligger i src/views mappen
app.set('views', path.join(__dirname, 'src/views'));
app.use(express.json()) //Sørger for at formatering er rigtigt, med @ osv mellem JSON object frem og tilbage

//bodyparser bruges til at analysere URL-kodede data, som kommer fra formularer
app.use(bodyParser.urlencoded({ extended: false }));

//statiske filer - kan tilgås gennem URL'en
app.use(express.static(path.join(__dirname, 'public')));

//alte HTTP-anmodninger, der starter med / bliver håndteret inde i web.js
app.use('/', webRoutes);

//localhost
app.listen(PORT, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log(`Server is running on port ${PORT}`);
    }
});