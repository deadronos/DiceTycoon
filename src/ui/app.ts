import { toDecimal, formatDecimal, DecimalHelpers } from '../utils/decimal';

type DieState = {
  id: number;
  locked: boolean;
  level: number;
  animationLevel: number;
  multiplier: string; // Decimal string
};

const INITIAL_CREDITS = '1000';

export function setupUI(container: HTMLElement) {
  container.innerHTML = '';
  const header = document.createElement('div');
  header.className = 'header';
  header.innerHTML = `<div class="credits">Credits: <span id="credits-value"></span></div>`;

  const main = document.createElement('div');
  main.className = 'container';

  const left = document.createElement('div');
  left.className = 'left';
  const diceGrid = document.createElement('div');
  diceGrid.className = 'dice-grid';

  const dice: DieState[] = [];
  for (let i = 0; i < 6; i++) {
    dice.push({ id: i, locked: i > 0, level: 0, animationLevel: 0, multiplier: toDecimal(1).toString() });
  }

  dice.forEach(d => {
    const card = document.createElement('div');
    card.className = 'die-card';
    card.setAttribute('data-id', String(d.id));
    if (d.locked) {
      const overlay = document.createElement('div');
      overlay.className = 'locked-overlay';
      overlay.innerHTML = `<div>Locked — unlock for 500</div>`;
      card.appendChild(overlay);
    } else {
      card.innerHTML = `<div class="face">[${d.id + 1}]</div><div class="small">Level: ${d.level}</div>`;
    }
    diceGrid.appendChild(card);
  });

  left.appendChild(diceGrid);

  const right = document.createElement('div');
  right.className = 'controls';
  right.innerHTML = `
    <button id="roll" class="roll-btn">Roll</button>
    <div style="height:12px"></div>
    <div class="small">Autoroll: <input type="checkbox" id="autoroll"></div>
    <div style="height:12px"></div>
    <div class="small">Recent: <div id="recent"></div></div>
  `;

  main.appendChild(left);
  main.appendChild(right);
  container.appendChild(header);
  container.appendChild(main);

  // state
  let credits = toDecimal(INITIAL_CREDITS);
  const creditsNode = document.getElementById('credits-value')!;
  function updateCredits() { creditsNode.textContent = formatDecimal(credits); }
  updateCredits();

  const rollBtn = document.getElementById('roll') as HTMLButtonElement;
  const recent = document.getElementById('recent')!;

  rollBtn.addEventListener('click', () => {
    rollBtn.disabled = true;
    // simple roll: sum of random faces * 1
    let sum = toDecimal(0);
    for (const d of dice) {
      if (!d.locked) {
        const face = Math.floor(Math.random() * 6) + 1;
        sum = sum.add(face);
      }
    }
    credits = credits.add(sum);
    recent.textContent = `+${formatDecimal(sum)}`;
    updateCredits();
    setTimeout(() => { rollBtn.disabled = false; }, 500);
  });
}
