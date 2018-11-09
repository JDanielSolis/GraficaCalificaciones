const env = 'local' //Ambiente de configuraciones sobre el que se trabajara
const config = require('./_config');
process.env = config[env]; //Cargamos el contenedor del ambiente configurado