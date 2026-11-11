// ---------- DADOS (edite aqui para mudar a rotina) ----------
// Cada bloco: [início, fim, título, nota]
const ROTINA = {
  util: { meta: [35, 50], blocos: [          // segunda a quinta
    ["05:00", "14:00", "Trabalho + deslocamento", "Leve o almoço preparado na véspera."],
    ["14:00", "15:40", "Casa e recomposição", "Sem treino hoje. Descanse e coma bem."],
    ["15:40", "18:30", "iFood (primeira rodada)", "Entregas de bicicleta."],
    ["18:30", "19:30", "Preparação para a faculdade", "Banho, comida e organizar as coisas."],
    ["19:30", "22:30", "Faculdade", "Foco nas aulas."],
    ["22:30", "23:50", "Encerramento do dia", "Jantar leve, higiene e dormir cedo."],
  ]},
  sex: { meta: [70, 100], blocos: [          // sexta
    ["05:00", "14:00", "Trabalho + deslocamento", "Leve o almoço preparado na véspera."],
    ["14:10", "15:20", "Academia: Upper", "Braços e ombros."],
    ["15:25", "15:40", "Café e descanso", "Pausa breve."],
    ["15:40", "23:30", "iFood (pico noturno)", "Alto fluxo da sexta. Dedicação total."],
  ]},
  fim: { meta: [80, 120], blocos: [          // sábado e domingo
    ["07:00", "08:30", "Treino", "Primeira tarefa do dia."],
    ["08:30", "11:30", "Estudos (3h)", "2h de revisão, 30 min de teoria, 30 min de questões."],
    ["12:30", "13:00", "Almoço reforçado", "Prepare o equipamento."],
    ["13:00", "18:00", "iFood (turno da tarde)", "Pausa para comer e carregar os aparelhos."],
    ["20:00", "21:30", "iFood (pico da noite)", "Se o cansaço for extremo, encerrar às 21h é permitido."],
  ]},
};

// Treinos por dia da semana (0 = domingo ... 6 = sábado): [exercício, séries x reps, descanso]
const TREINOS = {
  5: { titulo: "Upper", itens: [
    ["Supino Reto com Barra", "4 × 6–8", "3 min"],
    ["Remada Curvada com Barra", "4 × 6–8", "3 min"],
    ["Desenvolvimento c/ Halteres", "3 × 8–10", "2 min"],
    ["Puxada Alta na Polia", "3 × 10–12", "2 min"],
    ["Tríceps Testa + Rosca Direta (super-série)", "3 × 10–12", "90 seg"],
  ]},
  6: { titulo: "Legs", itens: [
    ["Agachamento Livre", "4 × 6–8", "3 min"],
    ["Stiff ou Flexora", "4 × 8–10", "2 min"],
    ["Leg Press 45°", "3 × 10–12", "2 min"],
    ["Gêmeos em Pé", "4 × 12–15", "60 seg"],
  ]},
  0: { titulo: "Torso", itens: [
    ["Levantamento Terra", "3 × 5", "3 min"],
    ["Supino Inclinado c/ Halteres", "4 × 8–10", "2 min"],
    ["Remada Baixa Triângulo", "4 × 8–10", "2 min"],
    ["Crucifixo Reto", "3 × 12", "90 seg"],
    ["Elevação Lateral de Ombro", "4 × 12–15", "60 seg"],
  ]},
};

const META_SEMANA = 500, PISO_SEMANA = 430, META_MOTO = 12500;

// ---------- FUNÇÕES AUXILIARES ----------
const $ = (seletor) => document.querySelector(seletor);
const reais = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const paraMin = (h) => { const [a, b] = h.split(":").map(Number); return a * 60 + b; };
const chave = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const tipoDoDia = (n) => (n === 5 ? "sex" : n === 0 || n === 6 ? "fim" : "util");

// ---------- SALVAR NO NAVEGADOR (localStorage) ----------
let dados = { ganhos: {}, cargas: {}, fundo: 0 };
try { Object.assign(dados, JSON.parse(localStorage.getItem("painel")) || {}); } catch (e) {}
const salvar = () => { try { localStorage.setItem("painel", JSON.stringify(dados)); } catch (e) {} };

// ---------- TELA: HORÁRIO E ROTINA ----------
function renderTempo() {
  const d = new Date();
  const agora = d.getHours() * 60 + d.getMinutes();
  const dia = ROTINA[tipoDoDia(d.getDay())];

  $("#relogio").textContent = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  $("#data").textContent = d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  const atual = dia.blocos.find((b) => agora >= paraMin(b[0]) && agora < paraMin(b[1]));
  const proximo = dia.blocos.find((b) => paraMin(b[0]) > agora);
  let html;
  if (atual) {
    const ini = paraMin(atual[0]), fim = paraMin(atual[1]);
    const falta = fim - agora;
    html = `<div class="agora-titulo">${atual[2]}</div>
            <div class="nota">${atual[3]}</div>
            <div class="barra"><i style="width:${Math.round(((agora - ini) / (fim - ini)) * 100)}%"></i></div>
            <div class="pequeno">faltam ${Math.floor(falta / 60)}h${String(falta % 60).padStart(2, "0")}</div>`;
  } else if (proximo) {
    html = `<div class="agora-titulo">Livre até ${proximo[0]}</div><div class="nota">Próximo: ${proximo[2]}</div>`;
  } else {
    html = `<div class="agora-titulo">Dia encerrado</div><div class="nota">Descanse. Dormir cedo faz parte do plano.</div>`;
  }
  $("#agora").innerHTML = html;

  $("#linha-tempo").innerHTML = dia.blocos.map((b) => {
    const cls = agora >= paraMin(b[1]) ? "feito" : agora >= paraMin(b[0]) ? "atual" : "";
    return `<li class="${cls}"><span class="hora">${b[0]}–${b[1]}</span><span>${b[2]}</span></li>`;
  }).join("");
}

// ---------- TELA: DINHEIRO ----------
function renderDinheiro() {
  const d = new Date();
  const [min, max] = ROTINA[tipoDoDia(d.getDay())].meta;
  const hoje = dados.ganhos[chave(d)] || 0;
  $("#meta-dia").textContent = `Meta de hoje: ${reais(min)} a ${reais(max)}`;
  $("#ganho").value = hoje || "";
  $("#barra-dia").style.width = Math.min(100, (hoje / max) * 100) + "%";

  // soma da semana (segunda a domingo)
  const seg = new Date(d);
  seg.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const x = new Date(seg);
    x.setDate(seg.getDate() + i);
    total += dados.ganhos[chave(x)] || 0;
  }
  $("#total-semana").textContent = `${reais(total)} de ${reais(META_SEMANA)} (piso ${reais(PISO_SEMANA)})`;
  $("#barra-semana").style.width = Math.min(100, (total / META_SEMANA) * 100) + "%";

  const fundo = dados.fundo || 0;
  $("#fundo").value = fundo || "";
  $("#total-fundo").textContent = `${reais(fundo)} de ${reais(META_MOTO)}`;
  $("#barra-fundo").style.width = Math.min(100, (fundo / META_MOTO) * 100) + "%";
}

// ---------- TELA: TREINO ----------
function renderTreino() {
  const n = new Date().getDay();
  const t = TREINOS[n];
  if (!t) {
    $("#treino").innerHTML = `<p class="nota">Hoje não tem treino. Descanso também é treino.</p>`;
    return;
  }
  $("#treino-titulo").textContent = "Treino de hoje: " + t.titulo;
  $("#treino").innerHTML = t.itens.map((e, i) => {
    const id = `${n}-${i}`;
    return `<div class="ex"><div>${e[0]}<small>${e[1]} · descanso ${e[2]}</small></div>
            <input type="number" inputmode="decimal" placeholder="kg" data-id="${id}" value="${dados.cargas[id] || ""}"></div>`;
  }).join("");
  document.querySelectorAll("#treino input").forEach((campo) => {
    campo.onchange = () => { dados.cargas[campo.dataset.id] = campo.value; salvar(); };
  });
}

// ---------- BOTÕES ----------
$("#salvar-ganho").onclick = () => { dados.ganhos[chave(new Date())] = Number($("#ganho").value) || 0; salvar(); renderDinheiro(); };
$("#salvar-fundo").onclick = () => { dados.fundo = Number($("#fundo").value) || 0; salvar(); renderDinheiro(); };

// ---------- INÍCIO ----------
renderTempo(); renderDinheiro(); renderTreino();
setInterval(renderTempo, 30000); // atualiza a cada 30 segundos

// ---------- OFFLINE (PWA) ----------
// O service worker guarda os arquivos no celular para o app abrir sem internet
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
