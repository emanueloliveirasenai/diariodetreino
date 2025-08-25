document.addEventListener("DOMContentLoaded", () => {
  // ===== Elementos e variáveis =====
  const formCadastroExercicio = document.getElementById("formCadastroExercicio");
  const tipoTreinoCadastro = document.getElementById("tipoTreinoCadastro");
  const nomeExercicio = document.getElementById("nomeExercicio");

  const formRegistrarTreino = document.getElementById("formRegistrarTreino");
  const tipoTreinoRegistro = document.getElementById("tipoTreinoRegistro");
  const exercicioSelect = document.getElementById("exercicioSelect");
  const pesquisaExercicio = document.getElementById("pesquisaExercicio");
  const seriesInput = document.getElementById("series");
  const repeticoesInput = document.getElementById("repeticoes");
  const cargaInput = document.getElementById("carga");
  const tbody = document.getElementById("tabelaTreinos");

  // ===== Cronômetro =====
  const startBtn = document.getElementById("startCronometro");
  const pauseBtn = document.getElementById("pauseCronometro");
  const resetBtn = document.getElementById("resetCronometro");
  const display = document.getElementById("displayCronometro");
  const inputMin = document.getElementById("minutos");
  const inputSeg = document.getElementById("segundos");

  let timer;
  let totalSegundos = parseInt(inputMin.value)*60 + parseInt(inputSeg.value);
  let running = false;

  function atualizarDisplay() {
    const min = Math.floor(totalSegundos/60).toString().padStart(2,'0');
    const seg = (totalSegundos%60).toString().padStart(2,'0');
    display.textContent = `${min}:${seg}`;

    // Últimos 5 segundos piscando
    if(totalSegundos <= 5 && totalSegundos > 0){
      display.classList.add("finalizando");
    } else {
      display.classList.remove("finalizando");
    }
  }

  function startCronometro() {
    if(running) return;
    running = true;
    totalSegundos = parseInt(inputMin.value)*60 + parseInt(inputSeg.value);
    atualizarDisplay();
    timer = setInterval(() => {
      if(totalSegundos <= 0){
        clearInterval(timer);
        running = false;
        display.classList.remove("finalizando");
        if(navigator.vibrate){
          navigator.vibrate([500,200,500]);
        }
        alert("Descanso finalizado!");
      } else {
        totalSegundos--;
        atualizarDisplay();
      }
    },1000);
  }

  function pauseCronometro() {
    clearInterval(timer);
    running = false;
    display.classList.remove("finalizando");
  }

  function resetCronometro() {
    clearInterval(timer);
    running = false;
    totalSegundos = parseInt(inputMin.value)*60 + parseInt(inputSeg.value);
    display.classList.remove("finalizando");
    atualizarDisplay();
  }

  startBtn.addEventListener("click", startCronometro);
  pauseBtn.addEventListener("click", pauseCronometro);
  resetBtn.addEventListener("click", resetCronometro);
  atualizarDisplay();

  // ===== Funções de Exercícios e Treinos =====
  function renderExercicios() {
    const exerciciosPorTreino = JSON.parse(localStorage.getItem("exerciciosPorTreino")) || { A:[], B:[], C:[], D:[], E:[] };
    const treinoSelecionado = tipoTreinoRegistro.value;
    const filtro = pesquisaExercicio.value.toLowerCase();
    exercicioSelect.innerHTML = `<option value="">Selecione o exercício</option>`;
    if(treinoSelecionado && exerciciosPorTreino[treinoSelecionado]){
      exerciciosPorTreino[treinoSelecionado]
        .filter(ex => ex.toLowerCase().includes(filtro))
        .forEach(ex=>{
          const option = document.createElement("option");
          option.value = ex;
          option.textContent = ex;
          exercicioSelect.appendChild(option);
        });
    }
  }

  tipoTreinoRegistro.addEventListener("change", () => { pesquisaExercicio.value=""; renderExercicios(); });
  pesquisaExercicio.addEventListener("input", renderExercicios);

  formCadastroExercicio.addEventListener("submit", e=>{
    e.preventDefault();
    const treino = tipoTreinoCadastro.value;
    const exNome = nomeExercicio.value.trim();
    if(!treino || !exNome) return;
    const exerciciosPorTreino = JSON.parse(localStorage.getItem("exerciciosPorTreino")) || {A:[],B:[],C:[],D:[],E:[]};
    if(!exerciciosPorTreino[treino].includes(exNome)){
      exerciciosPorTreino[treino].push(exNome);
      localStorage.setItem("exerciciosPorTreino", JSON.stringify(exerciciosPorTreino));
      nomeExercicio.value = "";
      tipoTreinoCadastro.value = "";
      renderExercicios();
      alert(`Exercício "${exNome}" adicionado ao Treino ${treino}`);
    }
  });

  formRegistrarTreino.addEventListener("submit", e=>{
    e.preventDefault();
    const tipoTreino = tipoTreinoRegistro.value;
    const exercicio = exercicioSelect.value;
    const series = seriesInput.value.trim();
    const repeticoes = repeticoesInput.value.trim();
    const carga = cargaInput.value.trim();
    if(!tipoTreino||!exercicio||!series||!repeticoes||!carga) return;
    const treinos = JSON.parse(localStorage.getItem("treinos"))||[];
    treinos.push({tipoTreino,exercicio,series,repeticoes,carga});
    localStorage.setItem("treinos", JSON.stringify(treinos));
    formRegistrarTreino.reset();
    exercicioSelect.innerHTML = `<option value="">Selecione o exercício</option>`;
    renderTreinos();
  });

  function renderTreinos(){
    tbody.innerHTML="";
    const treinos = JSON.parse(localStorage.getItem("treinos"))||[];
    treinos.forEach((t,i)=>{
      const tr = document.createElement("tr");
      tr.classList.add(`treino-${t.tipoTreino}`);
      tr.innerHTML = `<td>${t.tipoTreino}</td><td>${t.exercicio}</td><td>${t.series}</td><td>${t.repeticoes}</td><td>${t.carga}</td>
        <td><button class="editar" data-index="${i}">Editar</button> <button class="excluir" data-index="${i}">Excluir</button></td>`;
      tbody.appendChild(tr);
    });

    document.querySelectorAll("button.excluir").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const idx = btn.dataset.index;
        const treinos = JSON.parse(localStorage.getItem("treinos"))||[];
        treinos.splice(idx,1);
        localStorage.setItem("treinos", JSON.stringify(treinos));
        renderTreinos();
      });
    });

    document.querySelectorAll("button.editar").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const idx = btn.dataset.index;
        const treinos = JSON.parse(localStorage.getItem("treinos"))||[];
        const t = treinos[idx];
        const series = prompt("Séries:", t.series);
        const repeticoes = prompt("Repetições:", t.repeticoes);
        const carga = prompt("Carga (kg):", t.carga);
        if(series && repeticoes && carga){
          t.series=series; t.repeticoes=repeticoes; t.carga=carga;
          treinos[idx]=t;
          localStorage.setItem("treinos", JSON.stringify(treinos));
          renderTreinos();
        }
      });
    });
  }

  renderTreinos();
  renderExercicios();
});
