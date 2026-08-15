const state = {
  audioCtx: null,
  gainNode: null,
  volumeReal: 50,
  pendenteVolume: 50,
  respostaCaptcha: 0,
  ultimoClique: 0,
  contador: 1337,
};

function garantirAudio() {
  if (!state.audioCtx) {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) {
      document.getElementById("statusBox").innerHTML =
        "VOLUME REAL: " + state.volumeReal + "% <br> NAVEGADOR SEM SUPORTE A Web Audio API.";
      return false;
    }

    state.audioCtx = new AudioCtor();
    state.gainNode = state.audioCtx.createGain();
    state.gainNode.gain.value = state.volumeReal / 100;
    state.gainNode.connect(state.audioCtx.destination);
  }

  return true;
}

function tocarTom() {
  if (!garantirAudio()) return;

  const osc = state.audioCtx.createOscillator();
  osc.type = "sine";
  osc.frequency.value = 440;
  osc.connect(state.gainNode);
  osc.start();
  osc.stop(state.audioCtx.currentTime + 0.6);

  document.getElementById("statusBox").innerHTML =
    "VOLUME REAL: " + state.volumeReal + "% <br> TOM DE TESTE EM 440Hz REPRODUZIDO.";
}

function atualizarStatus(statusExtra = "") {
  const box = document.getElementById("statusBox");
  const extra = statusExtra ? " <br> " + statusExtra : "";
  box.innerHTML = "VOLUME REAL: " + state.volumeReal + "%" + extra;
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
  atualizarStatus("VOLUME PENDENTE: " + state.pendenteVolume + "%");
});

function cliqueAplicar() {
  const agora = Date.now();
  const intervalo = agora - state.ultimoClique;

  if (intervalo > 250 && intervalo < 800) {
    const confirmar = confirm("Tem certeza ABSOLUTA que deseja alterar o volume para " + state.pendenteVolume + "%?");
    if (confirmar) {
      state.volumeReal = state.pendenteVolume;
      if (state.gainNode) {
        state.gainNode.gain.value = state.volumeReal / 100;
      }
      atualizarStatus("VOLUME APLICADO COM SUCESSO!");
      alert("Volume aplicado com sucesso! (era só isso mesmo 😅)");
    } else {
      alert("Operação cancelada. O volume real continua " + state.volumeReal + "%.");
      atualizarStatus("APLICAÇÃO CANCELADA");
    }
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

gerarCaptcha();
sliderReal.disabled = true;
AtualizarStatusInicial();

function AtualizarStatusInicial() {
  document.getElementById("statusBox").innerHTML =
    "VOLUME REAL: " + state.volumeReal + "% <br> AGUARDANDO INTERAÇÃO DO USUÁRIO...";
}
