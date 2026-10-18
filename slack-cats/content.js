// Runs on every page. During a focus session, if this page is a "slack" site and
// the tab is visible, cats pop in and meow until you close the tab (or focus ends).
(function(){
  if (window.top !== window) return;
  var S = null, timer = null, delay = 2000, cats = [], host, root, banner, ctx, nagging = false;
  var hn = location.hostname.replace(/^www\./, '').toLowerCase();

  function match(list){
    return list.some(function(p){
      p = p.trim().toLowerCase().replace(/^www\./, '');
      return p && (hn === p || hn.endsWith('.' + p));
    });
  }
  function isSlack(){ return S.mode === 'block' ? match(S.blockSites) : !match(S.allowSites); }
  function rnd(a, b){ return a + Math.random() * (b - a); }

  // --- meow, synthesized (no sound files needed) ---
  function meow(){
    try{
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      var t = ctx.currentTime, dur = rnd(.45, .8), base = rnd(380, 620);
      var osc = ctx.createOscillator(); osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(base, t);
      osc.frequency.linearRampToValueAtTime(base * rnd(1.5, 1.9), t + dur * .35);
      osc.frequency.exponentialRampToValueAtTime(base * .7, t + dur);
      var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 4;
      f.frequency.setValueAtTime(700, t);
      f.frequency.linearRampToValueAtTime(1800, t + dur * .4);
      f.frequency.linearRampToValueAtTime(900, t + dur);
      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(.35, t + .06);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(f); f.connect(g); g.connect(ctx.destination);
      osc.start(t); osc.stop(t + dur + .05);
    }catch(e){}
  }
  // Browsers mute pages until you interact; any click/keypress unlocks the meows.
  ['pointerdown','keydown','click'].forEach(function(ev){
    addEventListener(ev, function(){ if (ctx && ctx.state === 'suspended') ctx.resume(); }, {capture:true, passive:true});
  });

  // --- overlay ---
  function build(){
    host = document.createElement('div');
    host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647';
    root = host.attachShadow({mode:'closed'});
    root.innerHTML = '<style>'
      + '.frame{position:fixed;inset:0;box-shadow:inset 0 0 0 8px #ffd400}'
      + '.banner{position:fixed;top:14px;left:50%;transform:translateX(-50%);background:#111;color:#fff;border:3px solid #fff;border-radius:999px;padding:8px 20px;font:600 18px/1.2 "Trebuchet MS",system-ui,sans-serif;white-space:nowrap}'
      + '.pop{position:fixed;transition:transform .55s cubic-bezier(.34,1.56,.64,1)}'
      + '.pop svg{width:100%;height:100%;display:block}'
      + '</style><div class="frame"></div><div class="banner"></div>';
    banner = root.querySelector('.banner');
    document.documentElement.appendChild(host);
  }
  function pop(){
    var vw = innerWidth, vh = innerHeight, edge = Math.floor(Math.random() * 4), isPaw = Math.random() < 0.14;
    var w = isPaw ? rnd(70, 110) : (Math.random() < 0.125 ? rnd(260, 340) : rnd(120, 230));
    var h = isPaw ? w * 2 : w * 1.31, peek = isPaw ? rnd(.5, .7) : rnd(.4, .7);
    var rot = [0, 90, 180, 270][edge], pos = rnd(.05, .95), cx, cy, ox = 0, oy = 0;
    if (edge === 0){ cx = vw * pos; cy = vh - h * peek + h / 2; oy = h; }
    if (edge === 1){ cx = h * peek - h / 2; cy = vh * pos; ox = -h; }
    if (edge === 2){ cx = vw * pos; cy = h * peek - h / 2; oy = -h; }
    if (edge === 3){ cx = vw - h * peek + h / 2; cy = vh * pos; ox = h; }
    var el = document.createElement('div');
    el.className = 'pop';
    el.style.cssText = 'width:' + w + 'px;height:' + h + 'px;left:' + (cx - w / 2) + 'px;top:' + (cy - h / 2) + 'px;transform:translate(' + ox + 'px,' + oy + 'px) rotate(' + rot + 'deg)';
    el.innerHTML = isPaw ? paw() : cat(['black','white','tux','spot'][Math.floor(Math.random() * 4)], 'wide');
    root.appendChild(el);
    el.getBoundingClientRect();
    el.style.transform = 'translate(0,0) rotate(' + rot + 'deg)';
    cats.push(el);
    if (cats.length > 30) cats.shift().remove();
    meow();
  }
  function loop(){
    if (!nagging) return;
    pop();
    delay = Math.max(600, delay - 120);
    timer = setTimeout(loop, delay);
  }
  function start(){ nagging = true; delay = 2000; build(); loop(); }
  function stop(){
    nagging = false; clearTimeout(timer); cats = [];
    if (host) { host.remove(); host = null; }
    if (document.title.indexOf('😾') === 0) document.title = document.title.replace(/^😾\s*/, '');
  }

  function tick(){
    if (!S) return;
    var p = phaseOf(S);
    var should = p.phase === 'focus' && isSlack() && !document.hidden;
    if (should && !nagging) start();
    else if (!should && nagging) stop();
    if (nagging){
      banner.textContent = 'Back to work! ' + fmt(p.left) + ' of focus left 😾';
      if (document.title.indexOf('😾') !== 0) document.title = '😾 ' + document.title;
    }
  }
  function load(){ chrome.storage.local.get(DEFAULTS, function(s){ S = s; tick(); }); }
  chrome.storage.onChanged.addListener(load);
  document.addEventListener('visibilitychange', tick);
  load();
  setInterval(tick, 1000);
})();
