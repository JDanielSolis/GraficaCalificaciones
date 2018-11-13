const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs-extra');
const xlsx = require('node-xlsx');
const camel = require('camelcase');
const upload = multer({ dest: 'uploads/' });

var arrHeaders = ['nombres', 'apellidoMaterno', 'apellidoPaterno', 'grado', 'grupo', 'calificacion']
var dataWorkSheet = [];
var headersTable = [];
var objData = [];

let getColors = () => {
    let colors = { border: [], background: [] };

    for (x = 0; x <= objData.length; x++) {
        let color = `${Math.floor((Math.random() * 255) + 1)}, ${Math.floor((Math.random() * 255) + 1)}, ${Math.floor((Math.random() * 255) + 1)}`
        colors.border.push(`rgba(${color}, 1)`)
        colors.background.push(`rgba(${color}, 0.2)`)
    }

    return colors
}

let getCal = () => {
    let data = { info: [], labels: [] };
    let grados = {}

    objData.forEach((obj) => {
        let grado = `Grado ${obj.grado}`
        if (!grados[grado]) grados[grado] = [];
        grados[grado].push(obj.calificacion)
    })
    let labels = Object.keys(grados)
    let promedios = [];

    labels.forEach((label) => {
        promedios.push(getPromedio(grados[label]))
    })

    data.info = promedios
    data.labels = labels;
    return data;
}

let getPromedio = (arr) => {
    let suma = 0;
    for (x = 0; x <= arr.length - 1; x++) {
        suma += arr[x];
    }
    let promedio = suma / arr.length
    return Number(promedio.toFixed(2))
}

let getData = (typeGraph) => {
    let data = { info: [], labels: [] };
    switch (typeGraph) {
        case 'bar':
            objData.forEach(objItem => { data.info.push(objItem.calificacion); data.labels.push('') })
            break;
        case 'pie':
            data = getCal()
            break;
    }
    return data
}

let chartData = (typeGraph) => {
    let displayOption = (typeGraph == 'bar') ? false : true; //Mostrar etiquetas en el tipo de grafica
    let border = 1; //grosor del borde de contormo de la representación de datos en la grafica           
    let colors = getColors()
    let data = getData(typeGraph)
    let titulo = (displayOption) ? 'Promedios por grado' : 'Calificaciones'
    let zero = {}

    if (!displayOption) {
        zero = {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }

    let objData = {
        type: typeGraph,
        data: {
            labels: data.labels,
            datasets: [{
                data: data.info,
                backgroundColor: colors.background,
                borderColor: colors.border,
                borderWidth: border
            }]
        },
        options: {
            legend: {
                display: displayOption
            },
            title: {
                display: true,
                text: titulo
            },
            scales: zero
        }
    }
    return objData
}

router.get('/', (req, res) => {
    let browser = (req.useragent.browser).toLocaleLowerCase()
    
    dataWorkSheet = [];
    objData = []
    headersTable = [];

    let render = (['firefox', 'chrome'].indexOf(browser) >= 0) ? 'graph' : 'alert';
    res.render(render);
});

router.get('/graph/:type', (req, res) => {
    let typeGraph = req.params.type; //Tipo de grafica a mostrar 
    let data = chartData(typeGraph)
    // console.log(JSON.stringify(data, undefined, 2))
    res.status(200).send(data)
})

router.get('/graph/mejor/peor/promedio', (req, res) => {
    let mejor = { cal: 0, nombre: '' };
    let suma = 0

    objData.forEach((obj) => {
        suma += obj.calificacion
        if (mejor.cal < obj.calificacion) {
            mejor.cal = obj.calificacion
            mejor.nombre = obj.nombres + " " + obj.apellidoPaterno + " " + obj.apellidoMaterno
        }
    })

    let peor = { cal: mejor.cal, nombre: '' };
    objData.forEach((obj) => {
        if (peor.cal > obj.calificacion) {
            peor.cal = obj.calificacion
            peor.nombre = obj.nombres + " " + obj.apellidoPaterno + " " + obj.apellidoMaterno
        }
    })

    let promedio = Number(suma / objData.length).toFixed(2)

    res.status(200).send({ mejor: mejor.nombre, peor: peor.nombre, promedio: promedio })
})

//Carga del archivo a server y memoria
router.post('/data/upload', upload.single('fileXlsx'), (req, res) => {
    try {
        if (req.file) {

            let ext = req.file.originalname.split('.')[1].toLocaleLowerCase()
            if (ext != 'xlsx') throw { error: `Archivo invalido (${ext})` }

            objData = [];

            dataWorkSheet = xlsx.parse(req.file.path)[0].data.filter(Boolean);
            headersTable = dataWorkSheet[0].filter(Boolean).map(item => item = camel(item))

            //validamos la cabecera del archivo
            if (arrHeaders.find(item => headersTable.indexOf(item) == -1)) throw { error: 'Falta alguna cabecera' }

            dataWorkSheet.splice(0, 1)
            dataWorkSheet.forEach(element => {
                let obj = {}
                let na = false;
                headersTable.forEach((item, index) => {
                    if (arrHeaders.indexOf(item) >= 0) {
                        if (item == 'calificacion' && (!element[index] || (typeof element[index] != 'number'))) na = true;
                        obj[item] = element[index]
                    }
                });
                if (!na) {
                    objData.push(obj)
                }
            });
            // console.log(objData)
            fs.remove(req.file.path)
            res.status(200).send({ success: 'Archivo cargado correctamente' })
        } else {
            throw { error: 'No se encontro archivo' }
        }

    } catch (error) {
        if (req.file) fs.remove(req.file.path)
        res.status(200).send(error)
    }
})

module.exports = router;