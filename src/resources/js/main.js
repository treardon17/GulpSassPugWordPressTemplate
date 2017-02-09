function currentYear(){
    let currentYear = new Date().getFullYear();
    $('.current-year').text(' ' + currentYear + '. ')
}

$(document).ready(()=>{
    currentYear();
});