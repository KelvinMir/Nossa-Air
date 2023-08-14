function toggleMenu() {
    const menu = document.getElementsByClassName('navbar-toggler');
    menu.classList.toggle('active');
  }
  
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

    // Exiba a seção alvo
    const targetSection = document.getElementById(targetSectionId);
    targetSection.style.display = "block";
  });
});

//Botão para fazer calendario de escolha de volta aparecer







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




//Busca de passagem 

document.getElementById("Passagens").addEventListener("submit", function (event) {
    event.preventDefault();

    const origem = document.getElementsById("origem").value;
    const destino = document.getElementsById("destino").value;
    const dataPartida = document.getElementById("dataPartida").value;

    buscarPassagens(Origem, Destino, data-partida);
});

function buscarPassagens(origem, destino, dataPartida) {
    fetch(`/buscar_passagens?origem=${origem}&destino=${destino}&data_partida=${dataPartida}`)
        .then(response => response.json())
        .then(dadosPassagens => exibirResultados(dadosPassagens))
        .catch(error => console.error("Erro na busca de passagens:", error));
}

function exibirResultados(dadosPassagens) {
    const resultadosDiv = document.getElementById("resultados");
    resultadosDiv.innerHTML = "";

    if (dadosPassagens && dadosPassagens.voos.length > 0) {
        dadosPassagens.voos.forEach(voo => {
            const vooInfo = document.createElement("div");
            vooInfo.innerHTML = `
                <p>Voo ${voo.numero}:</p>
                <p>Origem: ${voo.origem}</p>
                <p>Destino: ${voo.destino}</p>
                <p>Data e Hora de Partida: ${voo.data_partida}</p>
                <p>Data e Hora de Chegada: ${voo.data_chegada}</p>
                <p>Preço: ${voo.preco}</p>
                <hr>
            `;
            resultadosDiv.appendChild(vooInfo);
        });
    } else {
        resultadosDiv.innerHTML = "<p>Nenhum voo encontrado para esta rota na data informada.</p>";
    }
}





