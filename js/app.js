/* ============================================================
   SM TRANSPORTES – PLATAFORMA LOGÍSTICA 2.0
   app.js – BLOCO 1/6
   ============================================================ */

/* =============================
    VARIÁVEIS GLOBAIS
   ============================= */

let API_URL = ""; // será configurado na aba "Configurações"


/* =============================
    NAVEGAÇÃO SPA (Single Page)
   ============================= */

function show(sectionId) {
    // Oculta todas as seções
    document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));

    // Exibe a seção desejada
    document.getElementById(sectionId).classList.add("active");

    // Volta ao topo
    window.scrollTo(0, 0);

    // Caso abra a lista de OTs, recarregar
    if (sectionId === "ot-lista") {
        carregarOTs();
    }
}


/* =============================
    INICIALIZAÇÃO DO SISTEMA
   ============================= */

document.addEventListener("DOMContentLoaded", () => {
    console.log("Sistema iniciado…");

    // Tenta carregar OTs ao abrir
    try {
        carregarOTs();
    } catch (e) {
        console.warn("Ainda não há API configurada.");
    }
});


/* =============================
    HELPER – POST para Apps Script
   ============================= */

async function apiPOST(payload) {
    if (!API_URL) {
        alert("Configure a URL do Apps Script nas Configurações.");
        throw new Error("API_URL não configurada.");
    }

    const resp = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(payload),
    });

    return resp.json();
}


/* =============================
    HELPER – GET para Apps Script
   ============================= */

async function apiGET(params) {
    if (!API_URL) {
        alert("Configure a URL do Apps Script nas Configurações.");
        throw new Error("API_URL não configurada.");
    }

    const resp = await fetch(API_URL + "?" + params);
    return resp.json();
}
/* ============================================================
   MÓDULO: ORDENS DE TRANSPORTE (OT)
   BLOCO JS 2/6
   ============================================================ */


/* =============================
    LISTAR OTs
   ============================= */

async function carregarOTs() {
    try {
        const lista = await apiGET("action=listOT");

        const tbody = document.getElementById("ot-tabela-body");
        tbody.innerHTML = "";

        if (!lista || lista.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="6" style="text-align:center;">Nenhuma OT cadastrada.</td></tr>
            `;
            atualizarDashboard([]);
            return;
        }

        lista.forEach(ot => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${ot.id}</td>
                <td>${ot.cliente}</td>
                <td>${ot.origem}</td>
                <td>${ot.destino}</td>
                <td>${ot.status}</td>
                <td>
                    <button class="btn" onclick="verOT(${ot.id})">Ver</button>
                </td>
            `;

            tbody.appendChild(tr);
        });

        atualizarDashboard(lista);

    } catch (e) {
        console.error("Erro ao carregar OTs:", e);
    }
}



/* =============================
    SALVAR NOVA OT
   ============================= */

async function salvarOT(event) {
    event.preventDefault();

    const dadosOT = {
        action: "addOT",
        adjudicacao: document.getElementById("ot-data-adjudicacao").value,
        carga: document.getElementById("ot-data-carga").value,
        cliente: document.getElementById("ot-cliente").value,
        marca: document.getElementById("ot-marca").value,
        modelo: document.getElementById("ot-modelo").value,
        chassi: document.getElementById("ot-chassi").value,
        valor: document.getElementById("ot-valor").value,
        danos: document.getElementById("ot-danos").value,
        remetente: document.getElementById("ot-remetente").value,
        remetente_morada: document.getElementById("ot-remetente-morada").value,
        remetente_fone: document.getElementById("ot-remetente-fone").value,
        destinatario: document.getElementById("ot-destinatario").value,
        destinatario_morada: document.getElementById("ot-destinatario-morada").value,
        destinatario_fone: document.getElementById("ot-destinatario-fone").value
    };

    try {
        const resultado = await apiPOST(dadosOT);

        alert("OT criada com sucesso!");

        // Resetar o formulário
        document.getElementById("form-ot").reset();

        // Voltar para lista
        show("ot-lista");
        carregarOTs();

    } catch (e) {
        console.error("Erro ao salvar OT:", e);
        alert("Houve um erro ao salvar a Ordem de Transporte.");
    }
}

// Listener do formulário de OT
try {
    document.getElementById("form-ot").addEventListener("submit", salvarOT);
} catch(e) {
    console.warn("Formulário de OT ainda não disponível.");
}



/* =============================
    VISUALIZAR UMA OT
   ============================= */

async function verOT(id) {
    try {
        const dados = await apiGET("action=viewOT&id=" + id);

        let mensagem = "";
        mensagem += "ID: " + dados.id + "\\n";
        mensagem += "Cliente: " + dados.cliente + "\\n";
        mensagem += "Origem: " + dados.origem + "\\n";
        mensagem += "Destino: " + dados.destino + "\\n";
        mensagem += "Status: " + dados.status + "\\n";

        alert(mensagem);

    } catch (e) {
        console.error("Erro ao visualizar OT:", e);
        alert("Erro ao visualizar OT.");
    }
}
/* ============================================================
   MÓDULO: MOTORISTAS
   BLOCO JS 3/6
   ============================================================ */


/* =============================
    LISTAR MOTORISTAS
   ============================= */

async function carregarMotoristas() {
    try {
        const lista = await apiGET("action=listMotoristas");

        const tbody = document.getElementById("motoristas-tabela-body");
        tbody.innerHTML = "";

        if (!lista || lista.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="5" style="text-align:center;">Nenhum motorista encontrado.</td></tr>
            `;
            return;
        }

        lista.forEach(m => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${m.nome}</td>
                <td>${m.pais}</td>
                <td>${m.status}</td>
                <td>${m.horas || 0}</td>
                <td>
                    <button class="btn" onclick="editarMotorista('${m.id}')">Editar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (e) {
        console.error("Erro ao carregar motoristas:", e);
    }
}


/* =============================
    SALVAR NOVO MOTORISTA
   ============================= */

async function salvarMotorista() {

    const dadosMotorista = {
        action: "addMotorista",
        nome: document.getElementById("moto-nome").value,
        pais: document.getElementById("moto-pais").value,
        status: document.getElementById("moto-status").value
    };

    try {
        await apiPOST(dadosMotorista);

        alert("Motorista salvo com sucesso!");

        // resetar form
        document.getElementById("moto-nome").value = "";
        document.getElementById("moto-pais").value = "";
        document.getElementById("moto-status").value = "Disponível";

        // voltar à lista
        show("motoristas");
        carregarMotoristas();

    } catch (e) {
        console.error("Erro ao salvar motorista:", e);
        alert("Erro ao salvar motorista.");
    }
}


/* =============================
    EDITAR MOTORISTA (FUTURO)
   ============================= */

function editarMotorista(id) {
    alert("Função de edição do motorista ID " + id + " será adicionada na versão 2.1.");
}
/* ============================================================
   MÓDULO: FROTA
   BLOCO JS 4/6
   ============================================================ */


/* =============================
    LISTAR CAMINHÕES
   ============================= */

async function carregarFrota() {
    try {
        const lista = await apiGET("action=listFrota");

        const tbody = document.getElementById("frota-tabela-body");
        tbody.innerHTML = "";

        if (!lista || lista.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="6" style="text-align:center;">Nenhum caminhão cadastrado.</td></tr>
            `;
            return;
        }

        lista.forEach(f => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${f.codigo}</td>
                <td>${f.placa}</td>
                <td>${f.pais}</td>
                <td>${f.status}</td>
                <td>${f.km}</td>
                <td>
                    <button class="btn" onclick="editarCaminhao('${f.id}')">Editar</button>
                </td>
            `;

            tbody.appendChild(tr);
        });

    } catch (e) {
        console.error("Erro ao carregar frota:", e);
    }
}


/* =============================
    SALVAR NOVO CAMINHÃO
   ============================= */

async function salvarCaminhao() {

    const dadosCaminhao = {
        action: "addCaminhao",
        codigo: document.getElementById("frota-codigo").value,
        placa: document.getElementById("frota-placa").value,
        pais: document.getElementById("frota-pais").value,
        status: document.getElementById("frota-status").value,
        km: document.getElementById("frota-km").value
    };

    try {
        await apiPOST(dadosCaminhao);

        alert("Caminhão salvo com sucesso!");

        // reset do formulário
        document.getElementById("frota-codigo").value = "";
        document.getElementById("frota-placa").value = "";
        document.getElementById("frota-pais").value = "";
        document.getElementById("frota-status").value = "Disponível";
        document.getElementById("frota-km").value = "";

        // voltar
        show("frota");
        carregarFrota();

    } catch (e) {
        console.error("Erro ao salvar caminhão:", e);
        alert("Erro ao salvar caminhão.");
    }
}


/* =============================
    EDITAR CAMINHÃO (Futuro)
   ============================= */

function editarCaminhao(id) {
    alert("Função de edição de caminhão (ID " + id + ") será implementada na versão 2.1.");
}
/* ============================================================
   DASHBOARD – BLOCO JS 5/6
   ============================================================ */

function atualizarDashboard(listaOTs) {
    try {
        // Total de pedidos
        document.getElementById("dash-total-pedidos").innerText = listaOTs.length;

        // Em rota
        document.getElementById("dash-em-rota").innerText =
            listaOTs.filter(x => x.status === "Em rota").length;

        // Entregues
        document.getElementById("dash-entregues").innerText =
            listaOTs.filter(x => x.status === "Entregue").length;

        // Atualizar motoristas
        atualizarDashboardMotoristas();

        // Atualizar frota
        atualizarDashboardFrota();

    } catch (e) {
        console.warn("Falha ao atualizar dashboard:", e);
    }
}



/* =============================
    MOTORISTAS NO DASHBOARD
   ============================= */

async function atualizarDashboardMotoristas() {
    try {
        const lista = await apiGET("action=listMotoristas");

        document.getElementById("dash-motoristas-ativos").innerText =
            lista.filter(x => x.status === "Disponível" || x.status === "Em rota").length;

    } catch (e) {
        console.error("Erro ao atualizar motoristas no dashboard:", e);
    }
}



/* =============================
    FROTA NO DASHBOARD
   ============================= */

async function atualizarDashboardFrota() {
    try {
        const lista = await apiGET("action=listFrota");

        document.getElementById("dash-frota-disponivel").innerText =
            lista.filter(x => x.status === "Disponível").length;

    } catch (e) {
        console.error("Erro ao atualizar frota no dashboard:", e);
    }
}
/* ============================================================
   BLOCO JS 6/6 – FINALIZAÇÃO DO SISTEMA
   ============================================================ */


/* =============================
   CONFIGURAÇÃO DO APPS SCRIPT
   ============================= */

function salvarConfig() {
    const url = document.getElementById("config-script-url").value;

    if (!url || url.trim() === "") {
        alert("Insira uma URL válida do Apps Script.");
        return;
    }

    API_URL = url.trim();

    // Guardar no navegador (localStorage)
    localStorage.setItem("API_URL_SM", API_URL);

    alert("Configurações salvas com sucesso!");
}


/* =============================
   CARREGAR CONFIG AO INICIAR
   ============================= */

document.addEventListener("DOMContentLoaded", () => {
    const salva = localStorage.getItem("API_URL_SM");
    if (salva) {
        API_URL = salva;
        document.getElementById("config-script-url").value = salva;
    }
});


/* =============================
   BOTÃO MOBILE (MENU)
   ============================= */

const menu = document.getElementById("menu");

function toggleMenu() {
    menu.classList.toggle("open");
}

// Você pode adicionar este botão depois no HTML se quiser:
// <div class="menu-toggle" onclick="toggleMenu()">☰</div>


/* =============================
   LOGS (para debug)
   ============================= */

function log(...msg) {
    console.log("[SM-TMS]", ...msg);
}

log("Plataforma carregada.");
