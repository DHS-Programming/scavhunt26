document.querySelectorAll('.overlay').forEach(overlay => {
  overlay.addEventListener('click', function(e) {
    if (e.target === this) closeOverlay(this.id);
  });
});

function openOverlay(id) {
  document.getElementById(id).classList.add('active');
}

function closeOverlay(id) {
  document.getElementById(id).classList.remove('active');
}

async function sha256(message) {
  const msg = message+"";
  const msgBuffer = new TextEncoder().encode(msg.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function decrypt(answer, encryptedB64) {
  const ans = String(answer);
  const raw = atob(encryptedB64);
  const iv = new Uint8Array([...raw.slice(0, 16)].map(c => c.charCodeAt(0)));
  const data = new Uint8Array([...raw.slice(16)].map(c => c.charCodeAt(0)));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(ans.trim().toLowerCase().padEnd(16, '0').slice(0, 16)),
    "AES-CBC", false, ["decrypt"]
  );
  const decrypted = await crypto.subtle.decrypt({ name: "AES-CBC", iv }, keyMaterial, data);
  return new TextDecoder().decode(decrypted);
}

async function checkAnswer() {
  const input = document.getElementById('code-input').value + "";
  const hash = await sha256(input);
  const msg = document.getElementById('result-msg');

  if (hash === ANSWER_HASH) {
    localStorage.setItem(`puzzle${PUZZLE_NUMBER}_complete`, 'true');
    localStorage.setItem(`puzzle${PUZZLE_NUMBER}_answer`, input.trim().toLowerCase()+"");
    const clue = await decrypt(input, ENCRYPTED_CLUE);
    msg.innerHTML = `Correct! Your next clue: <strong>${clue}</strong>`;
    msg.className = 'result-correct';
  } else {
    msg.textContent = "Wrong answer, try again!";
    msg.className = 'result-wrong';
  }

  openOverlay('submit-overlay');
}

async function checkKey() {
  const input = document.getElementById('key-input').value;
  const hash = await sha256(input);
  if (hash === KEY_HASH) {
    showPuzzle();
  } else {
    document.getElementById('key-error').textContent = 'Incorrect key, try again.';
  }
}

function showPuzzle() {
  document.getElementById('key-gate').style.display = 'none';
  document.querySelector('.puzzle-content').style.display = 'contents';
  const hintBtn = document.getElementById('hint-button');
  if (hintBtn) hintBtn.style.display = '';
}

function initGates() {
  const notCompleteGate = document.getElementById('not-complete-gate');
  const keyGate = document.getElementById('key-gate');
  if (!notCompleteGate || !keyGate) return;

  const prevDone = localStorage.getItem(`puzzle${PUZZLE_NUMBER - 1}_complete`) === 'true';

  if (!prevDone) {
    notCompleteGate.style.display = 'block';
  } else {
    keyGate.style.display = 'block';
  }

  const keyInput = document.getElementById('key-input');
  if (keyInput) {
    keyInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') checkKey();
    });
  }
}

document.addEventListener('DOMContentLoaded', initGates);