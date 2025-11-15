
function formateDateFx(fecha) {
    var meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    var dia = fecha.getDate();
    var mes = fecha.getMonth();
    var anio = fecha.getFullYear();

    var fechaFormateada = dia + " de " + meses[mes] + " del " + anio;
    return fechaFormateada;
}

export default {
    formateDateFx
}