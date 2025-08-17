// Dice Tycoon - Prototype
// Data shapes and minimal game logic

const STORAGE_KEY = 'dicetycoon_v1';

class Die {
  constructor(sides, baseValue = 1, unlocked = false){
    this.sides = sides;
    this.baseValue = baseValue; // multiplier per face
    this.unlocked = unlocked;
  }
  roll(){
    return Math.floor(Math.random()*this.sides) + 1;
  }
}

const defaultState = () => ({
  coins: 0,
  luckPoints: 0,
  dice: [new Die(6,1,true), new Die(8,1,false), new Die(10,1,false), new Die(20,1,false)],
  currentDieIndex: 0,
  multiplier: 1,
  autoRollers: 0, // number of auto-rollers owned
  autoInterval: 2000, // ms
  lastRoll: null,
  rollsCount: 0,
});

let state = loadState();

// --- Persistence ---
function saveState(){
  try{
    const plain = {
      coins: state.coins,
      luckPoints: state.luckPoints,
      dice: state.dice.map(d=>({sides:d.sides,baseValue:d.baseValue,unlocked:d.unlocked})),
      currentDieIndex: state.currentDieIndex,
      multiplier: state.multiplier,
      autoRollers: state.autoRollers,
      autoInterval: state.autoInterval,
      lastRoll: state.lastRoll,
      rollsCount: state.rollsCount,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plain));
  }catch(e){console.error('save failed',e)}
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      const s = defaultState();
      s.coins = parsed.coins || 0;
      s.luckPoints = parsed.luckPoints || 0;
      s.dice = parsed.dice.map(d=> new Die(d.sides,d.baseValue, d.unlocked));
      s.currentDieIndex = parsed.currentDieIndex || 0;
      s.multiplier = parsed.multiplier || 1 + (s.luckPoints*0.01);
      s.autoRollers = parsed.autoRollers || 0;
      s.autoInterval = parsed.autoInterval || 2000;
      s.lastRoll = parsed.lastRoll || null;
      s.rollsCount = parsed.rollsCount || 0;
      return s;
    }
  }catch(e){console.error('load failed',e)}
  return defaultState();
}

// --- Economy ---
function coinReward(die, face){
  // base reward = face * baseValue
  const base = face * die.baseValue;
  // luck points give small permanent multiplier
  const luckMult = 1 + (state.luckPoints * 0.01);
  return Math.round(base * state.multiplier * luckMult);
}

// --- UI ---
const coinsEl = document.getElementById('coins');
const rollBtn = document.getElementById('roll-btn');
const dieEl = document.getElementById('die');
const lastRollEl = document.getElementById('last-roll');
const diceItemsEl = document.getElementById('dice-items');
const upgradesEl = document.getElementById('upgrades');
const luckEl = document.getElementById('luck');
const prestigeBtn = document.getElementById('prestige-btn');

function render(){
  coinsEl.textContent = state.coins;
  luckEl.textContent = state.luckPoints;
  const currentDie = state.dice[state.currentDieIndex];
  dieEl.textContent = currentDie.sides;
  lastRollEl.textContent = state.lastRoll ? `Last: ${state.lastRoll.face} (+${state.lastRoll.coins})` : 'Last: -';

  // dice list
  diceItemsEl.innerHTML = '';
  state.dice.forEach((d, idx)=>{
    const wrap = document.createElement('div');
    wrap.className = 'dice-item';
    const left = document.createElement('div');
    left.innerHTML = `<strong>D${d.sides}</strong><div class="tooltip">Value/face: ${d.baseValue}</div>`;
    const right = document.createElement('div');
    if(d.unlocked){
      const sel = document.createElement('button');
      sel.className = 'btn-small';
      sel.textContent = idx===state.currentDieIndex ? 'Selected' : 'Select';
      sel.disabled = idx===state.currentDieIndex;
      sel.onclick = ()=>{ state.currentDieIndex = idx; render(); saveState(); };
      right.appendChild(sel);
    } else {
      const cost = unlockCost(d);
      const buy = document.createElement('button');
      buy.className = 'btn-small';
      buy.textContent = `Unlock (${cost})`;
      buy.onclick = ()=>{ if(state.coins>=cost){ state.coins-=cost; d.unlocked=true; saveState(); render(); }};
      right.appendChild(buy);
    }
    wrap.appendChild(left);
    wrap.appendChild(right);
    diceItemsEl.appendChild(wrap);
  });

  // upgrades
  upgradesEl.innerHTML = '';
  // Auto-roller
  const autoWrap = document.createElement('div'); autoWrap.className='upgrade';
  const autoLeft = document.createElement('div'); autoLeft.innerHTML='<strong>Auto-Roller</strong><div class="tooltip">Automatically rolls every interval</div>';
  const autoRight = document.createElement('div');
  const autoCost = autoCostCalc();
  const autoBtn = document.createElement('button'); autoBtn.className='btn-small'; autoBtn.textContent=`Buy (${autoCost})`;
  autoBtn.onclick = ()=>{ if(state.coins>=autoCost){ state.coins-=autoCost; state.autoRollers++; state.autoInterval = Math.max(200, state.autoInterval - 100); saveState(); render(); }};
  autoRight.appendChild(autoBtn);
  autoWrap.appendChild(autoLeft); autoWrap.appendChild(autoRight);
  upgradesEl.appendChild(autoWrap);

  // Multiplier
  const multWrap = document.createElement('div'); multWrap.className='upgrade';
  const multLeft = document.createElement('div'); multLeft.innerHTML='<strong>Multiplier</strong><div class="tooltip">Increase coin multiplier</div>';
  const multRight = document.createElement('div');
  const multCost = multCostCalc();
  const multBtn = document.createElement('button'); multBtn.className='btn-small'; multBtn.textContent=`Buy (${multCost})`;
  multBtn.onclick = ()=>{ if(state.coins>=multCost){ state.coins-=multCost; state.multiplier = +(state.multiplier + 0.25).toFixed(2); saveState(); render(); }};
  multRight.appendChild(multBtn);
  multWrap.appendChild(multLeft); multWrap.appendChild(multRight);
  upgradesEl.appendChild(multWrap);

  // Offline earnings (passive)
  const offWrap = document.createElement('div'); offWrap.className='upgrade';
  const offLeft = document.createElement('div'); offLeft.innerHTML='<strong>Offline Earnings</strong><div class="tooltip">Earn while away (claimable)</div>';
  const offRight = document.createElement('div');
  const offCost = offlineCostCalc();
  const offBtn = document.createElement('button'); offBtn.className='btn-small'; offBtn.textContent=`Buy (${offCost})`;
  offBtn.onclick = ()=>{ if(state.coins>=offCost){ state.coins-=offCost; // simple: reduce interval further
    state.autoInterval = Math.max(150, state.autoInterval - 50); saveState(); render(); }};
  offRight.appendChild(offBtn);
  offWrap.appendChild(offLeft); offWrap.appendChild(offRight);
  upgradesEl.appendChild(offWrap);

}

// cost functions
function unlockCost(die){
  // tiers: larger dice cost more
  return die.sides * 50;
}
function autoCostCalc(){
  return 200 + (state.autoRollers * 150);
}
function multCostCalc(){
  return Math.round(300 * state.multiplier);
}
function offlineCostCalc(){
  return 500;
}

// --- Actions ---
rollBtn.addEventListener('click', ()=>{
  doRoll();
});

function doRoll(){
  const die = state.dice[state.currentDieIndex];
  if(!die.unlocked) return;
  const face = die.roll();
  const coins = coinReward(die, face);
  state.coins += coins;
  state.lastRoll = {face, coins};
  state.rollsCount++;
  // small chance to gain a luck point on rare high roll
  if(face === die.sides && Math.random() < 0.03) { state.luckPoints += 1; }
  saveState(); render(); animateDie(face);
}

function animateDie(face){
  const el = dieEl;
  // prevent overlapping animations
  if(el._rolling) return;
  el._rolling = true;
  el.classList.add('rolling');
  // tuned feel
  const duration = 820; // ms - slightly longer for weight
  const flickInterval = 48; // ms - faster flick for snappier feel
  // show quick random faces while rolling
  const start = Date.now();
  el.textContent = '...';
  const randTick = setInterval(()=>{
    const d = state.dice[state.currentDieIndex];
    el.textContent = Math.floor(Math.random()*d.sides) + 1;
  }, flickInterval);
  setTimeout(()=>{
    clearInterval(randTick);
    el.classList.remove('rolling');
    el.textContent = face;
    el._rolling = false;
    // critical roll: if face equals die.sides, play sound and particles
    const dieObj = state.dice[state.currentDieIndex];
    if(face === dieObj.sides){
      try{ playCriticalTone(); spawnParticles(el, 12); } catch(e){ /* no-op */ }
    }
  }, duration);
}

// small WebAudio beep for critical roll
function playCriticalTone(){
  try{
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 780;
    g.gain.value = 0.0001;
    o.connect(g); g.connect(ctx.destination);
    const now = ctx.currentTime;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
    o.start(now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    o.stop(now + 0.3);
  }catch(e){ console.warn('Audio not available', e); }
}

// spawn small particles from the die element
function spawnParticles(containerEl, count = 8){
  const rect = containerEl.getBoundingClientRect();
  const parent = containerEl.parentElement || document.body;
  for(let i=0;i<count;i++){
    const p = document.createElement('div');
    p.className = 'particle';
    const hue = 50 + Math.floor(Math.random()*40);
    p.style.background = `hsl(${hue}deg 90% 60%)`;
    // random velocity
    const dx = (Math.random()*160 - 80) + 'px';
    const dy = (Math.random()*-160 - 40) + 'px';
    p.style.setProperty('--dx', dx);
    p.style.setProperty('--dy', dy);
    const delay = Math.random()*0.05;
    const dur = 0.9 + Math.random()*0.3;
    p.style.animation = `particle-fall ${dur}s cubic-bezier(.2,.8,.2,1) ${delay}s forwards`;
    containerEl.appendChild(p);
    // cleanup
    setTimeout(()=>{ p.remove(); }, (dur+delay)*1000 + 40);
  }
}

// Auto-rolling loop
let lastAuto = Date.now();
function autoTick(){
  const now = Date.now();
  if(state.autoRollers > 0){
    // compute how many rolls should have happened since lastAuto
    const elapsed = now - lastAuto;
    const interval = Math.max(200, state.autoInterval);
    const expected = Math.floor(elapsed / interval) * state.autoRollers;
    for(let i=0;i<expected;i++) doRoll();
    if(expected>0) lastAuto = now;
  } else {
    lastAuto = now;
  }
}
setInterval(autoTick, 1000);

// Prestige
prestigeBtn.addEventListener('click', ()=>{
  // simple prestige: require some coins
  if(state.coins < 5000) { alert('Need 5,000 coins to prestige'); return; }
  const gained = Math.floor(state.coins / 5000);
  state.luckPoints += gained;
  // reset but keep unlocked die tiers? here we lock higher dice
  state.coins = 0;
  state.multiplier = 1 + (state.luckPoints * 0.01);
  state.autoRollers = 0;
  state.autoInterval = 2000;
  state.dice = state.dice.map(d=> new Die(d.sides, d.baseValue, d.sides===6));
  state.currentDieIndex = 0;
  state.lastRoll = null;
  state.rollsCount = 0;
  saveState(); render();
});

// initial render
render();

// periodic autosave
setInterval(saveState, 5000);

// expose for dev console
window._DT = {state, saveState};
