function toggleMenu() {
    const menu = document.getElementsByClassName('navbar-toggler');
    menu.classList.toggle('active');
  }
const toggleButtons = document.querySelectorAll(".Inicial");
const toggleSections = document.querySelectorAll(".toggle-section");

toggleButtons.forEach(button => {
  button.addEventListener("click", () => {
    
    const targetSectionId = button.dataset.target;

 // Selecione todos os botões e as seções controladas por eles
const toggleButtons = document.querySelectorAll(".Inicial");
const toggleSections = document.querySelectorAll(".toggle-section");

// Adicione o evento de clique a cada botão
toggleButtons.forEach(button => {
  button.addEventListener("click", () => {
    // Obtenha o ID da seção associada ao botão
    const targetSectionId = button.dataset.target;

    // Oculte todas as seções
    toggleSections.forEach(section => {
      section.style.display = "none";
    });
    const targetSection = document.getElementById(targetSectionId);
    targetSection.style.display = "block";
  });
});
const idavolta = document.getElementById('retorno1');
const voltar = document.getElementById('retorno2');
const dataretorno = document.getElementById('Retorno');
const idavolta = document.getElementById('retorno1');
const voltar = document.getElementById('retorno2');
const dataretorno = document.getElementById('retorno3');


idavolta.addEventListener('click', IdaEvolta);

function IdaEvolta() {
    if (idavolta.checked) {
        dataretorno.style.display = 'block';
         voltar.style.display = "block";
    } else {
        dataretorno.style.display = 'none';
        voltar.style.display = 'none';
    }
}





