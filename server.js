require('./core/ini'); //inicializamos las configuraciones

//Importamos la librerias necesarias para la ejecución del proyecto
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const hbs = require('express-hbs');
const open = require('open');

//Inicializamos 
const port = process.env.port;

app.engine('hbs', hbs.express4());
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', require('./routes/graph'));

app.listen(port, () => {
  console.log('Servidor en ejecución en puerto', port);
  open(`http://localhost:${port}`);
});