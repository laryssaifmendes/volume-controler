const sliderReal = document.getElementById('sliderReal');
const sliderFalso = document.getElementById('sliderFalso');
const captchaTexto = document.getElementById('captchaTexto');
const captchaInput = document.getElementById('captchaInput');
const captchaMsg = document.getElementById('captchaMsg');
const pendenteTxt = document.getElementById('pendenteTxt');
const statusBox = document.getElementById('statusBox');
const contador = document.getElementById('contador');
const caixaReal = document.getElementById('caixaReal');
const btnAplicar = document.getElementById('btnAplicar');
const audioPlayer = document.getElementById('audioPlayer');

let captchaResposta = 0;
let captchaLiberado = false;
let volumeAtual = 50;
let ultimoCliqueAplicar = 0;
let contadorVisitantes = 1337;
let audioCtx = null;
let gainNode = null;

function gerarCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const operacao = Math.random() > 0.5 ? '+' : '-';

  if (operacao === '+') {
    captchaResposta = a + b;
    captchaTexto.textContent = `${a} + ${b}`;
  } else {
    captchaResposta = a - b;
    captchaTexto.textContent = `${a} - ${b}`;
  }

  captchaInput.value = '';
  captchaMsg.textContent = 'Captcha carregado. Prove que você não é um robô de 1999.';
  captchaMsg.style.color = '#660000';
}

function validarCaptcha() {
  const valor = Number.parseInt(captchaInput.value, 10);

  if (Number.isNaN(valor)) {
    captchaMsg.textContent = 'Digite um número válido, por favor.';
    captchaMsg.style.color = 'red';
    return;
  }

  if (valor === captchaResposta) {
    captchaLiberado = true;
    sliderReal.disabled = false;
    sliderReal.value = 50;
    volumeAtual = 50;
    pendenteTxt.textContent = '50%';
    statusBox.innerHTML = 'VOLUME REAL: 50%<br>★ CAPTCHA VALIDADO. O slider finalmente responde.';
    captchaMsg.textContent = 'Humanidade confirmada. O controle foi liberado... por enquanto.';
    captchaMsg.style.color = 'green';
    atualizarVolumeReal(50);
  } else {
    captchaLiberado = false;
    sliderReal.disabled = true;
    captchaMsg.textContent = 'Resposta errada. O sistema recusa a sua presença digital.';
    captchaMsg.style.color = 'red';
    statusBox.innerHTML = 'VOLUME REAL: 0%<br>★ AGUARDANDO INTERAÇÃO DO USUÁRIO...';
    pendenteTxt.textContent = '0%';
    volumeAtual = 0;
  }
}

function garantirAudio() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    statusBox.innerHTML = 'VOLUME REAL: 0%<br>★ Seu navegador não suporta Web Audio API.';
    return null;
  }

  if (!audioCtx) {
    audioCtx = new AudioContextClass();
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.5;
    gainNode.connect(audioCtx.destination);
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  return { audioCtx, gainNode };
}

function atualizarVolumeReal(valor) {
  const volume = Math.max(0, Math.min(100, Number(valor) || 0));
  volumeAtual = volume;
  pendenteTxt.textContent = `${volume}%`;

  if (audioPlayer) {
    audioPlayer.volume = volume / 100;
  }

  if (gainNode) {
    gainNode.gain.value = volume / 100;
  }

  statusBox.innerHTML = `VOLUME REAL: ${volume}%<br>★ ${captchaLiberado ? 'AJUSTE EM TEMPO REAL' : 'AGUARDANDO INTERAÇÃO DO USUÁRIO...'}`;
}

function tocarTomTeste() {
  const contexto = garantirAudio();

  if (!contexto) {
    return;
  }

  const oscillator = contexto.audioCtx.createOscillator();
  const toneGain = contexto.audioCtx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.value = 440;

  toneGain.gain.value = Math.max(0.01, volumeAtual / 100) * 0.4;
  oscillator.connect(toneGain);
  toneGain.connect(contexto.gainNode);

  oscillator.start();
  oscillator.stop(contexto.audioCtx.currentTime + 0.2);

  statusBox.innerHTML = `VOLUME REAL: ${volumeAtual}%<br>★ TOM DE TESTE: 440Hz -> ${volumeAtual}%`;
}

function tocarTom() {
  tocarTomTeste();
}

function moverSliderFugaz() {
  if (!captchaLiberado || Math.random() > 0.65) {
    return;
  }

  const largura = caixaReal.clientWidth || 200;
  const altura = caixaReal.clientHeight || 40;
  const margemX = Math.max(0, largura - sliderReal.offsetWidth - 10);
  const margemY = Math.max(0, altura - sliderReal.offsetHeight - 10);

  sliderReal.style.position = 'absolute';
  sliderReal.style.left = `${Math.random() * margemX}px`;
  sliderReal.style.top = `${Math.random() * margemY}px`;
}

function cliqueAplicar() {
  if (!captchaLiberado) {
    statusBox.innerHTML = 'VOLUME REAL: 0%<br>★ Primeiro resolva o captcha, óbvio.';
    return;
  }

  const agora = Date.now();

  if (ultimoCliqueAplicar === 0) {
    ultimoCliqueAplicar = agora;
    statusBox.innerHTML = `VOLUME REAL: ${volumeAtual}%<br>★ Primeiro clique detectado. Agora bata no ritmo certo.`;
    return;
  }

  const diferenca = agora - ultimoCliqueAplicar;

  if (diferenca >= 250 && diferenca <= 800) {
    ultimoCliqueAplicar = 0;

    if (!window.confirm('Tem certeza?')) {
      statusBox.innerHTML = `VOLUME REAL: ${volumeAtual}%<br>★ Aplicação cancelada. O sistema está triste.`;
      return;
    }

    if (gainNode) {
      gainNode.gain.value = volumeAtual / 100;
    }

    statusBox.innerHTML = `VOLUME REAL: ${volumeAtual}%<br>★ VOLUME APLICADO COM SUCESSO!`;
    btnAplicar.textContent = 'Volume aplicado';
    setTimeout(() => {
      btnAplicar.textContent = 'Aplicar Volume (clique 2x no ritmo certo)';
    }, 1200);
  } else {
    ultimoCliqueAplicar = agora;
    statusBox.innerHTML = `VOLUME REAL: ${volumeAtual}%<br>★ Ritmo errado. Tente novamente no tempo certo.`;
  }
}

function iniciarContadorVisitantes() {
  setInterval(() => {
    const aumento = Math.floor(Math.random() * 17) + 2;
    contadorVisitantes += aumento;
    contador.textContent = String(contadorVisitantes).padStart(13, '0');
  }, 1800);
}

sliderReal.addEventListener('input', (event) => {
  const valor = Number(event.target.value);
  const volume = 100 - valor;
  atualizarVolumeReal(volume);
  if (audioPlayer && !audioPlayer.paused) {
    audioPlayer.volume = volume / 100;
  }
});

sliderFalso.addEventListener('input', () => {
  sliderFalso.value = 50;
  statusBox.innerHTML = 'VOLUME REAL: 50%<br>★ Esse slider não serve para nada. Como o resto da página.';
});

sliderReal.addEventListener('pointerenter', moverSliderFugaz);
sliderReal.addEventListener('mouseover', moverSliderFugaz);

const btnTocarTom = document.querySelector('button[onclick="tocarTom()"]');
if (btnTocarTom) {
  btnTocarTom.addEventListener('click', tocarTomTeste);
}

const btnValidar = document.querySelector('button[onclick="validarCaptcha()"]');
if (btnValidar) {
  btnValidar.addEventListener('click', validarCaptcha);
}

const btnAplicarOriginal = document.querySelector('button[onclick="cliqueAplicar()"]');
if (btnAplicarOriginal) {
  btnAplicarOriginal.addEventListener('click', cliqueAplicar);
}

sliderReal.disabled = true;
sliderReal.value = 50;
pendenteTxt.textContent = '50%';
if (audioPlayer) {
  audioPlayer.volume = 0.5;
}
statusBox.innerHTML = 'VOLUME REAL: 50%<br>★ AGUARDANDO INTERAÇÃO DO USUÁRIO...';

gerarCaptcha();
iniciarContadorVisitantes();

document.addEventListener('click', (event) => {
  if (event.target !== sliderReal && event.target !== sliderFalso && Math.random() < 0.12) {
    const popup = window.confirm('Você ganhou um prêmio! Deseja receber agora?');
    if (popup) {
      statusBox.innerHTML = 'VOLUME REAL: 50%<br>★ PRÊMIO RECEBIDO: 1x mais frustração.';
    }
  }
});

setInterval(() => {
  contadorVisitantes += Math.random() < 0.5 ? 1 : 0;
  contador.textContent = String(contadorVisitantes).padStart(13, '0');
}, 2200);

window.addEventListener('load', () => {
  garantirAudio();
});
