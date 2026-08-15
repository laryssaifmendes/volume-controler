const API_BASE = 'http://localhost:3000';

const state = {
  volumeReal: 50,
  pendenteVolume: 50,
  respostaCaptcha: 0,
  ultimoClique: 0,
  contador: 1337,
  systemAvailable: false,
};

// Fetch current system volume on startup
async function inicializarVolume() {
  try {
    const response = await fetch(`${API_BASE}/api/volume`);
    if (response.ok) {
      const data = await response.json();
      state.volumeReal = data.volume;
      state.pendenteVolume = data.volume;
      document.getElementById("sliderReal").value = state.volumeReal;
      document.getElementById("pendenteTxt").textContent = state.volumeReal + "%";
      state.systemAvailable = true;
      atualizarStatus("SISTEMA DE VOLUME PRONTO");
    }
  } catch (error) {
    console.error('Erro ao conectar ao servidor:', error);
    state.systemAvailable = false;
    atualizarStatus("⚠ SERVIDOR NÃO DISPONÍVEL - MODO DEMO");
  }
}

function tocarTom() {
  // Simple beep using Web Audio API
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = "sine";
  osc.frequency.value = 440;
  
  // Set gain to reflect current volume
  gain.gain.value = state.volumeReal / 100 * 0.3; // Reduce volume for safety
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.6);

  atualizarStatus("TOM DE TESTE EM 440Hz REPRODUZIDO");
}

function atualizarStatus(statusExtra = "") {
  const box = document.getElementById("statusBox");
  const systemStatus = state.systemAvailable ? "🟢 CONECTADO" : "🔴 DESCONECTADO";
  box.innerHTML = systemStatus + " | VOLUME REAL: " + state.volumeReal + "%" + (statusExtra ? " <br> " + statusExtra : "");
}

function gerarCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  state.respostaCaptcha = a + b;
  document.getElementById("captchaTexto").textContent = a + " + " + b;
  document.getElementById("captchaInput").value = "";
}

function validarCaptcha() {
  const input = document.getElementById("captchaInput");
  const valor = parseInt(input.value, 10);
  const msg = document.getElementById("captchaMsg");
  const sliderReal = document.getElementById("sliderReal");

  if (valor === state.respostaCaptcha) {
    msg.textContent = "✔ Acesso liberado! Boa sorte com o slider...";
    msg.style.color = "green";
    sliderReal.disabled = false;
    sliderReal.focus();
    atualizarStatus("AGUARDANDO AJUSTE DO USUÁRIO...");
  } else {
    msg.textContent = "✘ Errado! Tente de novo, humano suspeito.";
    msg.style.color = "red";
    sliderReal.disabled = true;
    gerarCaptcha();
  }
}

const sliderReal = document.getElementById("sliderReal");

sliderReal.addEventListener("mouseenter", () => {
  if (sliderReal.disabled) return;

  if (Math.random() < 0.65) {
    const maxDeslocamento = 120;
    const deslocamento = Math.floor(Math.random() * maxDeslocamento) - maxDeslocamento / 2;
    sliderReal.style.left = deslocamento + "px";
  }
});

sliderReal.addEventListener("mouseleave", () => {
  if (sliderReal.disabled) return;
  setTimeout(() => { sliderReal.style.left = "0px"; }, 900);
});

sliderReal.addEventListener("input", () => {
  state.pendenteVolume = parseInt(sliderReal.value, 10);
  document.getElementById("pendenteTxt").textContent = state.pendenteVolume + "%";
  
  // Apply volume in real-time
  aplicarVolumeEmTempo();
  
  atualizarStatus("VOLUME TEMPO REAL: " + state.pendenteVolume + "%");
});

async function aplicarVolumeEmTempo() {
  state.volumeReal = state.pendenteVolume;
  
  if (!state.systemAvailable) {
    atualizarStatus("⚠ SERVIDOR NÃO DISPONÍVEL - MUDANÇA LOCAL APENAS");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/volume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ volume: state.volumeReal })
    });

    if (response.ok) {
      atualizarStatus("VOLUME APLICADO: " + state.volumeReal + "%");
    } else {
      const error = await response.json();
      atualizarStatus("❌ ERRO: " + error.error);
    }
  } catch (error) {
    console.error('Erro ao enviar volume:', error);
    atualizarStatus("❌ ERRO DE CONEXÃO COM SERVIDOR");
  }
}

function cliqueAplicar() {
  const agora = Date.now();
  const intervalo = agora - state.ultimoClique;

  if (intervalo > 250 && intervalo < 800) {
    aplicarVolumeEmTempo();
    atualizarStatus("VOLUME APLICADO COM SUCESSO!");
    alert("Volume aplicado com sucesso! (era só isso mesmo 😅)");
    state.ultimoClique = 0;
  } else {
    state.ultimoClique = agora;
    atualizarStatus("CLIQUE DE NOVO ENTRE 0.25s E 0.8s PARA CONFIRMAR...");
  }
}

setInterval(() => {
  state.contador += Math.floor(Math.random() * 5);
  document.getElementById("contador").textContent = String(state.contador).padStart(10, "0");
}, 2000);

// Keyboard shortcuts
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp" || event.key === "+") {
    event.preventDefault();
    state.pendenteVolume = Math.min(100, state.pendenteVolume + 5);
    sliderReal.value = state.pendenteVolume;
    document.getElementById("pendenteTxt").textContent = state.pendenteVolume + "%";
    aplicarVolumeEmTempo();
  } else if (event.key === "ArrowDown" || event.key === "-") {
    event.preventDefault();
    state.pendenteVolume = Math.max(0, state.pendenteVolume - 5);
    sliderReal.value = state.pendenteVolume;
    document.getElementById("pendenteTxt").textContent = state.pendenteVolume + "%";
    aplicarVolumeEmTempo();
  }
});

// Mute toggle (M key)
document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === 'm') {
    event.preventDefault();
    const isMuted = state.volumeReal === 0;
    state.pendenteVolume = isMuted ? 50 : 0;
    sliderReal.value = state.pendenteVolume;
    document.getElementById("pendenteTxt").textContent = state.pendenteVolume + "%";
    aplicarVolumeEmTempo();
  }
});

// Initialize on page load
gerarCaptcha();
sliderReal.disabled = true;
inicializarVolume();
AtualizarStatusInicial();

function AtualizarStatusInicial() {
  atualizarStatus("AGUARDANDO INTERAÇÃO DO USUÁRIO... | Use ↑↓ para ajuste rápido, M para mutar");
}
