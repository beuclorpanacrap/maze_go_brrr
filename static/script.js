const wall = 1;
const path_type = 4;

const rows = 23;
const columns = 35;

let current_grid = null;
let running = false;

sparkles();
new_maze();

async function new_maze() {
    if (running) return;
    set_status('Loading the slay...💗')

    const response = await fetch('/api/maze');
    const data = await response.json();

    draw_grid(data.grid);
    reset_stats();
    document.getElementById('button-solve').disabled = false;
    set_status('Ready to Slay! 💅');
}

async function solve_maze() {
    if (running || !current_grid) return;
    running = true;
    document.getElementById('button-solve').disabled = true;
    set_status('Girliepop is getting ready... 💕');

    const start_time = Date.now();
    document.getElementById('val-time').textContent = '0.00';
    const timer = setInterval(() => {
        document.getElementById('val-time').textContent = ((Date.now() - start_time) / 1000).toFixed(2);
    }, 50);

    const response = await fetch('/api/solve', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ grid: current_grid }),
    });
    const data = await response.json();

    if (data.found) {
        set_status('It was found! You go girl!! 👑');
        await draw_path(data.path);
        update_stats(data.path_len);
    } else {
        set_status('No path... not iconic 😢');
    }

    clearInterval(timer);
    document.getElementById('val-time').textContent = ((Date.now() - start_time) / 1000).toFixed(2);
    running = false;
    document.getElementById('button-solve').disabled = true;
}

function draw_grid(grid) {
    current_grid = grid;
    const container = document.getElementById('maze-grid');
    container.innerHTML = '';

    grid.forEach((row, r) => {
        const row_element = document.createElement('div');
        row_element.className = 'maze-row';

        row.forEach((cell_type, c) => {
            const cell = document.createElement('div');
            cell.id = `cell-${r}-${c}`;
            cell.className = `cell ${cssClass(cell_type)}`;

            if (r === 1 && c === 1) cell.textContent = '👸';
            if (r === rows - 2 && c === columns - 2) cell.textContent = '👑';

            row_element.appendChild(cell);
        });

        container.appendChild(row_element);
    });
}

async function draw_path(path) {
    for (const [r, c] of path) {
        const cell = document.getElementById(`cell-${r}-${c}`);
        if (cell && cell.textContent !== '👸' && cell.textContent !== '👑') {
           cell.className = `cell ${cssClass(path_type)}`;
        }
        await pause(10);
    }
}

function cssClass(type) {
  const classes = ['c-free', 'c-wall', 'c-start', 'c-end', 'c-path', 'c-visited', 'c-current'];
  return classes[type] ?? 'c-free';
}

function pause(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function reset_stats() {
  document.getElementById('val-path').textContent = '—';
  document.getElementById('unit-path').textContent = '';
  document.getElementById('val-time').textContent = '—';
  document.getElementById('coverage-bar').style.width = '0%';
  document.getElementById('coverage-precentage').textContent = '0% slay!';
}

function update_stats(length) {
  document.getElementById('val-path').textContent  = length;
  document.getElementById('unit-path').textContent = 'steps';

  const coverage = Math.min(100, (length / (rows * columns / 2)) * 100).toFixed(1);
  document.getElementById('coverage-bar').style.width = coverage + '%';
  document.getElementById('coverage-precentage').textContent = coverage + '% slay!';
}

function set_status(text) {
  document.getElementById('status-text').textContent = text;
}

function sparkles() {
  const symbols = ["✦", "✧", "⋆", "✺", "✼", "❋", "✿", "♡", "★", "✨"];
  const colors  = ["#fff", "#ffb6c1", "#fff700", "#ff85c8"];

  for (let i = 0; i < 50; i++) {
    const sparkle = document.createElement('div');
    sparkle.className   = 'sparkle';
    sparkle.textContent = symbols[i % symbols.length];
    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.bottom = `${Math.random() * 5}%`;
    sparkle.style.fontSize = `${8 + Math.random() * 14}px`;
    sparkle.style.opacity = `${0.2 + Math.random() * 0.5}`;
    sparkle.style.color = colors[i % colors.length];
    sparkle.style.animationDuration = `${7 + Math.random() * 10}s`;
    sparkle.style.animationDelay = `${Math.random() * 9}s`;

    document.body.appendChild(sparkle);
  }
}
(function() {
  const GAP = 48;
  const COLS = Math.ceil(window.innerWidth / GAP) + 1;
  const ROWS = Math.ceil(window.innerHeight / GAP) + 1;

  const grid = document.getElementById('heart-grid');
  grid.style.cssText = `
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    overflow: hidden;
  `;

  const hearts = [];
  let mouse = { x: -999, y: -999 };

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const el = document.createElement('div');
      el.textContent = '♡';
      el.style.fontSize = '28px';
      el.style.cssText = `
        position: absolute;
        left: ${c * GAP}px;
        top: ${r * GAP}px;
        font-size: 16px;
        color: rgba(255,255,255,0.3);
        transform: scale(1);
        transition: transform 0.6s, color 0.6s;
        user-select: none;
        pointer-events: none;
      `;
      grid.appendChild(el);
      hearts.push({ el, x: c * GAP, y: r * GAP });
    }
  }

  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    hearts.forEach(({ el, x, y }) => {
      const dx = x - mouse.x;
      const dy = y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const proximity = 130;

      if (dist < proximity) {
        const scale = 1 + (1 - dist / proximity) * 1.5;
        el.style.transform = `scale(${scale})`;
        el.style.color = '#ffffff';
        el.style.transition = 'transform 0.1s, color 0.1s';
      } else {
        el.style.transform = 'scale(1)';
        el.style.color = 'rgba(255,255,255,0.5)';
        el.style.transition = 'transform 0.6s, color 0.6s';
      }
    });
  });

  document.getElementById('loading-screen').addEventListener('click', () => {
    document.getElementById('loading-screen').classList.add('hide');
    setTimeout(() => {
      document.getElementById('loading-screen').remove();
    }, 500);
  });
})();