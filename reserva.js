// ==============================
// CLASSES DO SISTEMA
// ==============================

let salaParaConfirmar = null;

// ajusta o input date inicial (novo id study-data)
const studyDateInput = document.getElementById("study-data");
if (studyDateInput) {
    studyDateInput.value = new Date().toISOString().split("T")[0];
}

// Classe Usuario
class Usuario {
    constructor(nome, matricula, pendencia, acessibilidade) {
        this.nome = nome;
        this.matricula = matricula;
        this.pendencia = pendencia;
        this.acessibilidade = acessibilidade;
    }

    reservarSala() {
        this.pendencia = true;
    }
}

// Classe Sala
class Sala {
    constructor(id, formato, status, acessivel) {
        this.id = id;
        this.formato = formato;
        this.status = status;
        this.acessivel = acessivel;
        this.dataReserva = null;
        this.dataEntrega = null;
    }

    marcarReservado() {
        this.status = false;
    }

    definirDatas() {
        let agora = new Date();
        this.dataReserva = agora.toLocaleDateString("pt-BR");

        let entrega = new Date(agora.getTime() + 24 * 60 * 60 * 1000);
        this.dataEntrega = entrega.toLocaleDateString("pt-BR");
    }
}

// Classe SistemaReserva
class SistemaReserva {
    constructor(usuario, salas) {
        this.usuario = usuario;
        this.salas = salas;
    }

    filtrarDisponiveis(tipoSelecionado) {
        return this.salas.filter(s => 
            s.formato === tipoSelecionado &&
            s.status === true &&
            (this.usuario.acessibilidade ? s.acessivel === true : true)
        );
    }

    confirmarReserva(sala) {
        if (this.usuario.pendencia) {
            return { erro: "Você possui uma pendência! Devolva sua sala anterior antes de reservar outra." };
        }

        sala.marcarReservado();
        sala.definirDatas();
        this.usuario.reservarSala();

        return { sucesso: sala };
    }
}

// =====================================
// INSTÂNCIAS INICIAIS DO SISTEMA
// =====================================

const usuario = new Usuario("Allan", "1234", false, true);

const salas = [
    new Sala(1, "individual", true, false),
    new Sala(2, "individual", true, true),
    new Sala(3, "individual", true, true),
    new Sala(4, "grupo", true, true),
    new Sala(5, "grupo", false, true),
    new Sala(6, "grupo", true, false)
];

const sistema = new SistemaReserva(usuario, salas);

// ==============================
// FUNÇÃO DE EXIBIR SALAS NA TELA
// ==============================

function renderizarSalas(lista) {
    const grid = document.querySelector(".study-salas-grid");
    if (!grid) return;
    grid.innerHTML = "";

    if (lista.length === 0) {
        grid.innerHTML = `<p style="padding: 10px;">Nenhuma sala disponível.</p>`;
        return;
    }

    lista.forEach(sala => {
        const div = document.createElement("div");
        div.classList.add("study-sala");

        // botões de reserva usam classe study-btn e dataset id
        div.innerHTML = `
            <h4>Sala ${sala.id}</h4>
            <p>${sala.formato} • ${sala.acessivel ? "Acessível" : "Não acessível"}</p>
            <button class="study-btn" data-id="${sala.id}">Reservar</button>
        `;

        grid.appendChild(div);
    });

    // attach listeners
    document.querySelectorAll(".study-btn").forEach(btn => {
        btn.addEventListener("click", () => reservar(btn.dataset.id));
    });
}

// ==============================
// HELPERS DE UI (limpeza de classes)
function limparFeedbacks() {
    const fb = document.querySelectorAll(".study-feedback");
    fb.forEach(el => {
        // remove classes de erro/sucesso e limpa texto
        el.classList.remove("error", "success");
        el.textContent = "";
    });
}
// ==============================

// ==============================
// EVENTOS DO SISTEMA
// ==============================

const botaoBuscar = document.getElementById("study-buscar");
if (botaoBuscar) {
    botaoBuscar.addEventListener("click", () => {
        const tipoEl = document.getElementById("study-tipo");
        const feedbackEl = document.getElementById("study-feedback");

        const tipo = tipoEl ? tipoEl.value : "";

        // limpa feedbacks anteriores
        if (feedbackEl) { feedbackEl.textContent = ""; feedbackEl.className = "study-feedback"; }

        if (!tipo) {
            if (feedbackEl) {
                feedbackEl.innerHTML = "Por favor, selecione um tipo de sala.";
                feedbackEl.classList.add("error");
            }
            renderizarSalas([]);
            return;
        }

        const filtradas = sistema.filtrarDisponiveis(tipo);
        renderizarSalas(filtradas);

        if (filtradas.length === 0 && feedbackEl) {
            feedbackEl.innerText = "Nenhuma sala disponível para esse tipo.";
            feedbackEl.classList.add("error");
        }
    });
}

// Quando o usuário clica em "Reservar"
function reservar(id) {
    const tipoEl = document.getElementById("study-tipo");
    const feedbackEl = document.getElementById("study-feedback");
    const tipo = tipoEl ? tipoEl.value : "";

    if (!tipo) {
        if (feedbackEl) {
            feedbackEl.innerHTML = "Selecione o tipo de sala antes de reservar.";
            feedbackEl.classList.add("error");
        }
        return;
    }

    const filtradas = sistema.filtrarDisponiveis(tipo);
    const salaSelecionada = filtradas.find(s => s.id == id);

    if (!salaSelecionada) {
        if (feedbackEl) {
            feedbackEl.innerHTML = "Sala não encontrada ou indisponível.";
            feedbackEl.classList.add("error");
        }
        return;
    }

    salaParaConfirmar = salaSelecionada;

    const modalTexto = document.getElementById("study-modalTexto");
    const modalErro = document.getElementById("study-modalErro");
    const modal = document.getElementById("study-modalReserva");

    if (modalTexto) modalTexto.innerText = `Deseja confirmar a reserva da sala ${salaSelecionada.id}?`;
    if (modalErro) { modalErro.innerHTML = ""; modalErro.className = "study-feedback"; }
    if (modal) {
        modal.style.display = "flex";
        modal.setAttribute("aria-hidden", "false");
    }
}

// Botão cancelar (novo id study-cancelarReserva)
const btnCancelar = document.getElementById("study-cancelarReserva");
if (btnCancelar) {
    btnCancelar.addEventListener("click", () => {
        salaParaConfirmar = null;
        const modal = document.getElementById("study-modalReserva");
        if (modal) {
            modal.style.display = "none";
            modal.setAttribute("aria-hidden", "true");
        }
    });
}

// Botão confirmar (novo id study-confirmarReserva)
const btnConfirmar = document.getElementById("study-confirmarReserva");
if (btnConfirmar) {
    btnConfirmar.addEventListener("click", () => {
        const feedback = document.getElementById("study-feedbackReserva");
        const modalErro = document.getElementById("study-modalErro");
        const card = document.getElementById("study-cardFeedback");

        if (modalErro) { modalErro.innerHTML = ""; modalErro.className = "study-feedback"; }
        if (feedback) { feedback.innerHTML = ""; feedback.className = "study-feedbackReserva"; }
        if (card) card.style.display = "block";

        if (!salaParaConfirmar) {
            if (modalErro) { modalErro.innerHTML = "Erro interno: nenhuma sala selecionada."; modalErro.classList.add("error"); }
            return;
        }

        const resultado = sistema.confirmarReserva(salaParaConfirmar);

        if (resultado.erro) {
            if (modalErro) { modalErro.innerHTML = resultado.erro; modalErro.classList.add("error"); }
            return;
        }

        const sala = resultado.sucesso;

        if (feedback) {
            feedback.innerHTML =
                `✔ Sala ${sala.id} reservada com sucesso! <br>
                 📅 Reserva: ${sala.dataReserva} <br>
                 📆 Entrega: ${sala.dataEntrega}`;
            feedback.classList.add("success");
        }

        const modal = document.getElementById("study-modalReserva");
        if (modal) {
            modal.style.display = "none";
            modal.setAttribute("aria-hidden", "true");
        }

        // Re-renderiza a lista atual (mantendo filtro selecionado)
        const tipoEl = document.getElementById("study-tipo");
        const tipoAtual = tipoEl ? tipoEl.value : "";
        const filtradas = tipoAtual ? sistema.filtrarDisponiveis(tipoAtual) : [];

        renderizarSalas(filtradas);

        salaParaConfirmar = null;
    });
}

// Optionally, render a default empty grid on load
document.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector(".study-salas-grid");
    if (grid) grid.innerHTML = `<p style="padding:10px;">Use o filtro e clique em "Buscar Salas Disponíveis".</p>`;
});
