let host = "http://localhost";
let port = 8000;
let chart = {};

let getGraph = function (type) {
    $.get(host + ":" + port + "/graph/" + type, function (objData) {
        let element = document.getElementById(type);
        if (chart[type]) chart[type].destroy()
        chart[type] = new Chart(element, objData);
    })
};

$(document).ready(function () {
    getGraph('bar')
    getGraph('pie')
    $('#uploadForm').change(function () {
        $('#uploadForm').submit()
    })
    $('#uploadForm').submit(function () {
        $("#status").empty().text("Cargando archivo...");

        $(this).ajaxSubmit({
            error: function (xhr) {
                $("#status").empty().text("Error cargando archivo...");
            },
            success: function (response) {
                if (response.error) return $("#status").html("<p class='alert alert-danger'><i class='glyphicon glyphicon-remove'></i> " + response.error + "</p>");

                //El mejor, el peor y el promedio general
                $.get(host + ":" + port + "/graph/mejor/peor/promedio", function (objData) {
                    $("#mejorAlumno").html(objData.mejor);
                    $("#peorAlumno").html(objData.peor);
                    $("#promedioGral").html(objData.promedio);
                })
                getGraph('bar')
                getGraph('pie')

                $("#status").empty().text("");
                $('#customFile').val('');
            }
        });

        return false;
    });
});  