// Dice Tycoon - Prototype
// Data shapes and minimal game logic

const STORAGE_KEY = 'dicetycoon_v1';
const BACKUP_KEY = 'dicetycoon_backup_v1';

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
  coins: (typeof BN !== 'undefined') ? BN.from('0') : 0,
  luckPoints: 0,
  dice: [new Die(6,1,true), new Die(8,1,false), new Die(10,1,false), new Die(20,1,false)],
  currentDieIndex: 0,
  selectedDiceIndices: [0], // indices of dice selected for multi-rolls
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
      // coins may be a BN instance; serialize as string for persistence
      coins: (state.coins && state.coins.toBigInt) ? state.coins.toBigInt().toString() : String(state.coins),
      luckPoints: state.luckPoints,
      dice: state.dice.map(d=>({sides:d.sides,baseValue:d.baseValue,unlocked:d.unlocked})),
      currentDieIndex: state.currentDieIndex,
  selectedDiceIndices: state.selectedDiceIndices,
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
      // coins were saved as string; convert to BN if BN exists
      try{
        s.coins = (typeof BN !== 'undefined') ? BN.from(parsed.coins||'0') : (parsed.coins || 0);
      }catch(e){ s.coins = parsed.coins || 0; }
      s.luckPoints = parsed.luckPoints || 0;
      s.dice = parsed.dice.map(d=> new Die(d.sides,d.baseValue, d.unlocked));
      s.currentDieIndex = parsed.currentDieIndex || 0;
  s.selectedDiceIndices = parsed.selectedDiceIndices || [s.currentDieIndex];
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
const multiDiceEl = document.getElementById('multi-dice');
const resetBtn = document.getElementById('reset-btn');
const saveBtn = document.getElementById('save-btn');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const dataModal = document.getElementById('data-modal');
const dataText = document.getElementById('data-text');
const dataImportBtn = document.getElementById('data-import');
const dataCopyBtn = document.getElementById('data-copy');
const dataCloseBtn = document.getElementById('data-close');
const dataPreview = document.getElementById('data-preview');
const confirmModal = document.getElementById('confirm-modal');
const confirmTitle = document.getElementById('confirm-title');
const confirmBody = document.getElementById('confirm-body');
const confirmYes = document.getElementById('confirm-yes');
const confirmNo = document.getElementById('confirm-no');
const toastEl = document.getElementById('toast');

function render(){
  // display coins using BN.format when available
  if(state.coins && state.coins.toBigInt && typeof BN !== 'undefined') coinsEl.textContent = BN.format(state.coins);
  else coinsEl.textContent = String(state.coins);
  luckEl.textContent = state.luckPoints;
  const currentDie = state.dice[state.currentDieIndex];
  if (typeof dieEl !== 'undefined' && dieEl && dieEl !== null) dieEl.textContent = currentDie.sides;
  if(state.lastRoll && state.lastRoll.results){
    const faces = state.lastRoll.results.map(r=>r.face).join(' + ');
    const total = state.lastRoll.total || state.lastRoll.results.reduce((s,r)=>s+r.coins,0);
    const bonus = state.lastRoll.bonusCoins ? ` (+${state.lastRoll.bonusCoins} bonus)` : '';
    lastRollEl.textContent = `Last: ${faces} = ${total}${bonus}`;
  } else {
    lastRollEl.textContent = 'Last: -';
  }

  // dice list
  diceItemsEl.innerHTML = '';
  state.dice.forEach((d, idx)=>{
    const wrap = document.createElement('div');
    wrap.className = 'dice-item';
    const left = document.createElement('div');
    left.innerHTML = `<strong>D${d.sides}</strong><div class="tooltip">Value/face: ${d.baseValue}</div>`;
    const right = document.createElement('div');
    if(d.unlocked){
      // multi-select checkbox-like button
      const sel = document.createElement('button');
      sel.className = 'btn-small';
      const selected = state.selectedDiceIndices.includes(idx);
      sel.textContent = selected ? 'Selected' : 'Select';
      sel.setAttribute('aria-pressed', String(selected));
      sel.onclick = ()=>{
        const pos = state.selectedDiceIndices.indexOf(idx);
        if(pos >= 0){
          // if removing last selected, ensure at least one remains
          if(state.selectedDiceIndices.length === 1) return;
          state.selectedDiceIndices.splice(pos,1);
        } else {
          state.selectedDiceIndices.push(idx);
        }
        state.currentDieIndex = state.selectedDiceIndices[0] || 0;
        saveState(); render();
      };
      right.appendChild(sel);
    } else {
      const cost = unlockCost(d);
      const buy = document.createElement('button');
      buy.className = 'btn-small';
      buy.textContent = `Unlock (${cost})`;
      buy.onclick = ()=>{
        const coinVal = (state.coins && state.coins.toBigInt) ? state.coins : BN.from(state.coins);
        if(BN.lt(coinVal, BN.from(cost))){ return; }
        state.coins = BN.sub(coinVal, BN.from(cost));
        d.unlocked=true; saveState(); render();
      };
      right.appendChild(buy);
    }
  // mark selected
  if(state.selectedDiceIndices && state.selectedDiceIndices.includes(idx)) wrap.classList.add('selected');
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
  autoBtn.onclick = ()=>{
    const coinVal = (state.coins && state.coins.toBigInt) ? state.coins : BN.from(state.coins);
    if(BN.lt(coinVal, BN.from(autoCost))){ return; }
    state.coins = BN.sub(coinVal, BN.from(autoCost));
    state.autoRollers++; state.autoInterval = Math.max(200, state.autoInterval - 100); saveState(); render();
  };
  autoRight.appendChild(autoBtn);
  autoWrap.appendChild(autoLeft); autoWrap.appendChild(autoRight);
  upgradesEl.appendChild(autoWrap);

  // Multiplier
  const multWrap = document.createElement('div'); multWrap.className='upgrade';
  const multLeft = document.createElement('div'); multLeft.innerHTML='<strong>Multiplier</strong><div class="tooltip">Increase coin multiplier</div>';
  const multRight = document.createElement('div');
  const multCost = multCostCalc();
  const multBtn = document.createElement('button'); multBtn.className='btn-small'; multBtn.textContent=`Buy (${multCost})`;
  multBtn.onclick = ()=>{
    const coinVal = (state.coins && state.coins.toBigInt) ? state.coins : BN.from(state.coins);
    if(BN.lt(coinVal, BN.from(multCost))){ return; }
    state.coins = BN.sub(coinVal, BN.from(multCost));
    state.multiplier = +(state.multiplier + 0.25).toFixed(2);
    saveState(); render();
  };
  multRight.appendChild(multBtn);
  multWrap.appendChild(multLeft); multWrap.appendChild(multRight);
  upgradesEl.appendChild(multWrap);

  // Offline earnings (passive)
  const offWrap = document.createElement('div'); offWrap.className='upgrade';
  const offLeft = document.createElement('div'); offLeft.innerHTML='<strong>Offline Earnings</strong><div class="tooltip">Earn while away (claimable)</div>';
  const offRight = document.createElement('div');
  const offCost = offlineCostCalc();
  const offBtn = document.createElement('button'); offBtn.className='btn-small'; offBtn.textContent=`Buy (${offCost})`;
  offBtn.onclick = ()=>{
    const coinVal = (state.coins && state.coins.toBigInt) ? state.coins : BN.from(state.coins);
    if(BN.lt(coinVal, BN.from(offCost))){ return; }
    state.coins = BN.sub(coinVal, BN.from(offCost));
    state.autoInterval = Math.max(150, state.autoInterval - 50);
    saveState(); render();
  };
  offRight.appendChild(offBtn);
  offWrap.appendChild(offLeft); offWrap.appendChild(offRight);
  upgradesEl.appendChild(offWrap);

  // Unlock All (bundle) - discounted
  const lockedCount = state.dice.filter(d=>!d.unlocked).length;
  if(lockedCount>0){
    const allWrap = document.createElement('div'); allWrap.className='upgrade';
    const allLeft = document.createElement('div'); allLeft.innerHTML='<strong>Unlock All Dice</strong><div class="tooltip">Unlock all remaining dice at a discount</div>';
    const allRight = document.createElement('div');
    const baseSum = state.dice.filter(d=>!d.unlocked).reduce((s,d)=>s + unlockCost(d), 0);
    const discount = 0.75; // 25% off
    const allCost = Math.max(1, Math.round(baseSum * discount));
    const allBtn = document.createElement('button'); allBtn.className='btn-small'; allBtn.textContent=`Buy (${allCost})`;
    allBtn.onclick = ()=>{
      const coinVal = (state.coins && state.coins.toBigInt) ? state.coins : BN.from(state.coins);
      if(BN.lt(coinVal, BN.from(allCost))){ return; }
      state.coins = BN.sub(coinVal, BN.from(allCost));
      state.dice.forEach(d=> { if(!d.unlocked) d.unlocked = true; });
      saveState(); render();
    };
    allRight.appendChild(allBtn);
    allWrap.appendChild(allLeft); allWrap.appendChild(allRight);
    upgradesEl.appendChild(allWrap);
  }

  // multi-dice display (selected dice)
  if(multiDiceEl){
    multiDiceEl.innerHTML = '';
    const indices = state.selectedDiceIndices && state.selectedDiceIndices.length ? state.selectedDiceIndices : [state.currentDieIndex];
    indices.forEach(idx=>{
      const d = state.dice[idx];
      const m = document.createElement('div');
      m.className = 'mini-die';
      // show last face if lastRoll has a result for this idx
      let faceText = d.sides;
      if(state.lastRoll && state.lastRoll.results){
        const found = state.lastRoll.results.find(r=>r.idx===idx);
        if(found) faceText = found.face;
      }
      m.textContent = faceText;
      multiDiceEl.appendChild(m);
    });
  }

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

// Manual controls
resetBtn.addEventListener('click', ()=>{
  // backup and show custom confirm modal
  backupState();
  confirmTitle.textContent = 'Reset game?';
  confirmBody.textContent = 'A backup was created. Do you want to reset the game now?';
  confirmModal.setAttribute('aria-hidden','false');
  // on yes: perform reset
  const yesHandler = ()=>{
  localStorage.removeItem(STORAGE_KEY);
  state = defaultState();
  try{ state.coins = (typeof BN !== 'undefined') ? BN.from('0') : 0; }catch(e){ state.coins = 0; }
  saveState(); render(); confirmModal.setAttribute('aria-hidden','true'); showToast('Game reset (backup saved)');
    confirmYes.removeEventListener('click', yesHandler);
    confirmNo.removeEventListener('click', noHandler);
  };
  const noHandler = ()=>{ confirmModal.setAttribute('aria-hidden','true'); confirmYes.removeEventListener('click', yesHandler); confirmNo.removeEventListener('click', noHandler); };
  confirmYes.addEventListener('click', yesHandler);
  confirmNo.addEventListener('click', noHandler);
});
saveBtn.addEventListener('click', ()=>{ saveState(); alert('Saved'); });
exportBtn.addEventListener('click', ()=>{
  dataText.value = JSON.stringify({
  coins: (state.coins && state.coins.toBigInt) ? state.coins.toBigInt().toString() : String(state.coins),
    luckPoints: state.luckPoints,
    dice: state.dice.map(d=>({sides:d.sides,baseValue:d.baseValue,unlocked:d.unlocked})),
    currentDieIndex: state.currentDieIndex,
    selectedDiceIndices: state.selectedDiceIndices,
    multiplier: state.multiplier,
    autoRollers: state.autoRollers,
    autoInterval: state.autoInterval,
    lastRoll: state.lastRoll,
    rollsCount: state.rollsCount,
  }, null, 2);
  dataModal.setAttribute('aria-hidden','false');
  showPreview(dataText.value);
});
importBtn.addEventListener('click', ()=>{ dataModal.setAttribute('aria-hidden','false'); dataText.value = ''; showPreview(''); });
dataCloseBtn.addEventListener('click', ()=>{ dataModal.setAttribute('aria-hidden','true'); });
dataCopyBtn.addEventListener('click', async ()=>{
  try{ await navigator.clipboard.writeText(dataText.value); alert('Copied to clipboard'); }catch(e){ alert('Copy failed'); }
});
dataImportBtn.addEventListener('click', ()=>{
  try{
    const parsed = JSON.parse(dataText.value);
    if(!(parsed && Array.isArray(parsed.dice))) { alert('Invalid data'); return; }
    // show confirm dialog summarizing import
    confirmTitle.textContent = 'Apply imported data?';
    confirmBody.textContent = `This will overwrite current progress. A backup will be created first. Proceed?`;
    confirmModal.setAttribute('aria-hidden','false');
    const yesHandler = ()=>{
      try{
        backupState();
  try{ state.coins = (typeof BN !== 'undefined') ? BN.from(parsed.coins||'0') : (parsed.coins||0); }catch(e){ state.coins = parsed.coins||0; }
        state.luckPoints = parsed.luckPoints||0;
        state.dice = parsed.dice.map(d=> new Die(d.sides,d.baseValue, d.unlocked));
        state.currentDieIndex = parsed.currentDieIndex || 0;
        state.selectedDiceIndices = parsed.selectedDiceIndices || [state.currentDieIndex];
        state.multiplier = parsed.multiplier || 1;
        state.autoRollers = parsed.autoRollers || 0;
        state.autoInterval = parsed.autoInterval || 2000;
        state.lastRoll = parsed.lastRoll || null;
        state.rollsCount = parsed.rollsCount || 0;
        saveState(); render(); dataModal.setAttribute('aria-hidden','true'); showToast('Import applied (backup saved)');
      }catch(e){ alert('Import failed: ' + e.message); }
      confirmModal.setAttribute('aria-hidden','true');
      confirmYes.removeEventListener('click', yesHandler);
      confirmNo.removeEventListener('click', noHandler);
    };
    const noHandler = ()=>{ confirmModal.setAttribute('aria-hidden','true'); confirmYes.removeEventListener('click', yesHandler); confirmNo.removeEventListener('click', noHandler); };
    confirmYes.addEventListener('click', yesHandler);
    confirmNo.addEventListener('click', noHandler);
  }catch(e){ alert('Import failed: ' + e.message); }
});

function backupState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) localStorage.setItem(BACKUP_KEY, raw);
  }catch(e){ console.warn('backup failed', e); }
}

function showPreview(text){
  if(!dataPreview) return;
  if(!text) { dataPreview.textContent = 'Paste JSON here to preview.'; return; }
  try{
    const obj = JSON.parse(text);
    dataPreview.textContent = JSON.stringify(obj, null, 2);
  }catch(e){ dataPreview.textContent = 'Invalid JSON: ' + e.message; }
}

// preview as user types
if(dataText){ dataText.addEventListener('input', ()=> showPreview(dataText.value)); }

function showToast(msg, ms=2200){
  if(!toastEl) return; toastEl.textContent = msg; toastEl.classList.add('show');
  setTimeout(()=>{ toastEl.classList.remove('show'); }, ms);
}

function doRoll(){
  // roll all selected dice
  const indices = state.selectedDiceIndices.length ? state.selectedDiceIndices.slice() : [state.currentDieIndex];
  const results = [];
  for(const idx of indices){
    const die = state.dice[idx];
    if(!die.unlocked) continue;
    const face = die.roll();
    const coins = coinReward(die, face);
    results.push({idx, sides: die.sides, face, coins});
  // add numeric coins to BN state.coins
  const coinVal = (state.coins && state.coins.toBigInt) ? state.coins : BN.from(state.coins);
  state.coins = BN.add(coinVal, BN.from(coins));
    state.rollsCount++;
    // luck point chance per die on max face
    if(face === die.sides && Math.random() < 0.03) { state.luckPoints += 1; }
  }

  // combo detection: analyze faces across results (group by face value)
  const faceCounts = {};
  results.forEach(r=>{ faceCounts[r.face] = (faceCounts[r.face]||0)+1; });
  const counts = Object.values(faceCounts).sort((a,b)=>b-a);
  let combo = null; let comboBonus = 0;
  // pair, two-pair, triple, full house, four-of-kind (if applicable)
  if(counts[0] >= 4) { combo = 'four-of-a-kind'; comboBonus = 4; }
  else if(counts[0] === 3 && counts[1] === 2) { combo = 'full-house'; comboBonus = 3; }
  else if(counts[0] === 3) { combo = 'triple'; comboBonus = 2.5; }
  else if(counts[0] === 2 && counts[1] === 2) { combo = 'two-pair'; comboBonus = 1.75; }
  else if(counts[0] === 2) { combo = 'pair'; comboBonus = 1.25; }
  // straight detection (only meaningful if dice share same sides and count >=3)
  if(!combo && results.length>=3){
    const facesSorted = results.map(r=>r.face).sort((a,b)=>a-b);
    let straight = true;
    for(let i=1;i<facesSorted.length;i++){
      if(facesSorted[i] !== facesSorted[i-1]+1) { straight = false; break; }
    }
    if(straight){ combo = 'straight'; comboBonus = 2; }
  }

  // apply combo bonus as multiplier on total coins gained this roll
  const rollTotal = results.reduce((s,r)=>s+r.coins, 0);
  let bonusCoins = 0;
  if(combo){
    bonusCoins = Math.round(rollTotal * (comboBonus - 1));
    const coinVal2 = (state.coins && state.coins.toBigInt) ? state.coins : BN.from(state.coins);
    state.coins = BN.add(coinVal2, BN.from(bonusCoins));
  }

  state.lastRoll = { results, combo, bonusCoins, total: rollTotal + bonusCoins };
  saveState(); render(); animateMultiRoll(state.lastRoll);
}

function animateDie(face){
  const el = (multiDiceEl && multiDiceEl.querySelector('.mini-die')) || dieEl;
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

function animateMultiRoll(lastRoll){
  const container = multiDiceEl || dieEl;
  // per-mini-die animation
  const miniDice = container ? Array.from(container.querySelectorAll('.mini-die')) : [];
  // guard against overlapping
  if(container._rolling) return;
  container._rolling = true;
  const duration = 900;
  const flickInterval = 48;
  const ticks = Math.floor(duration / flickInterval);
  let tick = 0;
  const intervalId = setInterval(()=>{
    miniDice.forEach((m, i)=>{
      const r = lastRoll.results[i % lastRoll.results.length];
      m.textContent = Math.floor(Math.random() * (r.sides || 6)) + 1;
      m.classList.add('rolling');
    });
    tick++;
    if(tick >= ticks){
      clearInterval(intervalId);
      // set final faces
      miniDice.forEach((m, i)=>{
        const r = lastRoll.results[i % lastRoll.results.length];
        if(r) m.textContent = r.face; else m.textContent = '-';
        m.classList.remove('rolling');
      });
      // combo effects
      if(lastRoll.combo){
        try{ playCriticalTone(); spawnParticles(container, 18); } catch(e){}
        // flash container briefly
        container.style.transition = 'box-shadow 180ms ease';
        container.style.boxShadow = '0 8px 40px rgba(255,210,102,0.18)';
        setTimeout(()=>{ container.style.boxShadow = ''; container._rolling = false; }, 500);
      } else {
        container._rolling = false;
      }
    }
  }, flickInterval);
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
  // simple prestige: require some coins (BN-aware)
  try{
    const coinVal = (state.coins && state.coins.toBigInt) ? state.coins : BN.from(state.coins);
    if(BN.lt(coinVal, BN.from(5000))) { alert('Need 5,000 coins to prestige'); return; }
    const gained = Number( coinVal.toBigInt() / BigInt(5000) );
    state.luckPoints += gained;
    // reset but keep unlocked die tiers? here we lock higher dice
    state.coins = BN.from('0');
    state.multiplier = 1 + (state.luckPoints * 0.01);
    state.autoRollers = 0;
    state.autoInterval = 2000;
    state.dice = state.dice.map(d=> new Die(d.sides, d.baseValue, d.sides===6));
    state.currentDieIndex = 0;
    state.lastRoll = null;
    state.rollsCount = 0;
    saveState(); render();
  }catch(e){ console.error('prestige failed', e); }
});

// initial render
render();

// periodic autosave
setInterval(saveState, 5000);

// expose for dev console
window._DT = {state, saveState};
