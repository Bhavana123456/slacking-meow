var $ = function(id){ return document.getElementById(id); };
var S, shown, lastPhase = '';

function readSites(){ return $('sites').value.split('\n').map(function(x){ return x.trim(); }).filter(Boolean); }
function key(m){ return m === 'block' ? 'blockSites' : 'allowSites'; }
function persist(){
  S.focusMin = Math.max(1, +$('focus').value || 25);
  S.breakMin = Math.max(1, +$('brk').value || 5);
  S.mode = shown;
  S[key(shown)] = readSites();
  chrome.storage.local.set({focusMin:S.focusMin, breakMin:S.breakMin, mode:S.mode, blockSites:S.blockSites, allowSites:S.allowSites});
}
function fill(){
  $('focus').value = S.focusMin; $('brk').value = S.breakMin;
  shown = S.mode; $('mode').value = shown;
  $('sites').value = S[key(shown)].join('\n');
}
function render(){
  var p = phaseOf(S);
  $('time').textContent = fmt(p.left);
  $('status').textContent = p.phase === 'focus' ? 'Focus. The cats are watching.' : p.phase === 'break' ? 'Break time. Stretch!' : 'Ready when you are';
  $('go').textContent = S.running ? 'Stop session' : 'Start focus';
  document.body.dataset.phase = p.phase;
  if (p.phase !== lastPhase){
    lastPhase = p.phase;
    $('cat').innerHTML = cat('black', p.phase === 'break' ? 'closed' : 'sleepy');
  }
}
$('go').onclick = function(){
  S.running = !S.running;
  if (S.running) S.startedAt = Date.now();
  chrome.storage.local.set({running:S.running, startedAt:S.startedAt});
  render();
};
$('mode').onchange = function(){
  S[key(shown)] = readSites();
  shown = $('mode').value;
  $('sites').value = S[key(shown)].join('\n');
  persist();
};
['focus','brk','sites'].forEach(function(id){ $(id).addEventListener('input', persist); });

chrome.storage.local.get(DEFAULTS, function(s){ S = s; fill(); render(); setInterval(render, 500); });
