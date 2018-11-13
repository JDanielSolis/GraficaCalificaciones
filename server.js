require('./core/ini'); //inicializamos las configuraciones

//Importamos la librerias necesarias para la ejecución del proyecto
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const hbs = require('express-hbs');
const open = require('open');
const favicon = require('serve-favicon');
const path = require('path')
const useragent = require('express-useragent');

//Inicializamos 
const host = process.env.host;
const port = process.env.port;

app.use(express.static(path.join(__dirname, "/public")));
app.use(favicon(path.join(__dirname, "/public/assets/img/favicon.png")));

app.engine('.hbs', hbs.express4());
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, "/views"));

app.use(useragent.express());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', require('./routes/graph'));

app.listen(port, () => {
  console.log('Servidor en puerto', port);
  open(`http://${host}:${port}`);
});