function leiaOpcaoSelecionada() {
    var origemSelect = document.getElementById("origemSelect");
    var selectedOption = origemSelect.options[origemSelect.selectedIndex].text;

}
var hoje = new Date().toISOString().split('T')[0];
  
  // Define a data mínima para o input date como a data atual
  document.getElementById("Partida").setAttribute("min", hoje);    
  document.getElementById("Return").setAttribute("min", hoje);    