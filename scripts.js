const TOTAL_PUZZLES = 7;

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str + ""));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function allPuzzlesComplete() {
  return Array.from({length: TOTAL_PUZZLES}, (_, i) => i + 1)
    .every(n => localStorage.getItem(`puzzle${n}_complete`) === 'true');
}

async function generateCode(name) {
  const answers = Array.from({length: TOTAL_PUZZLES}, (_, i) => i + 1)
    .map(n => localStorage.getItem(`puzzle${n}_answer`) || '')
    .join('');
  const code = await sha256(name.trim().toLowerCase() + answers);
  return code.slice(0, 12).toUpperCase();
}

function initIndex() {
  if (!document.getElementById('final-submit')) return;

  document.querySelectorAll('.btn[data-puzzle]').forEach(btn => {
    const num = btn.getAttribute('data-puzzle');
    if (localStorage.getItem(`puzzle${num}_complete`) === 'true') {
      btn.classList.add('completed');
    }
  });

  if (allPuzzlesComplete()) {
    document.getElementById('final-submit').style.display = 'flex';
  }
}

function initSubmit() {
  if (!document.getElementById('submit-section')) return;

  if (!allPuzzlesComplete()) {
    document.getElementById('blocked').style.display = 'block';
    return;
  }

  document.getElementById('submit-section').style.display = 'flex';

  document.getElementById('generate-btn').addEventListener('click', async () => {
    const name = document.getElementById('name-input').value.trim();
    if (!name) {
      document.getElementById('name-error').textContent = 'Please enter your full name.';
      return;
    }
    document.getElementById('name-error').textContent = '';

    const code = await generateCode(name);
    document.getElementById('submission-code').textContent = code;
    document.getElementById('code-section').style.display = 'block';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initIndex();
  initSubmit();
});