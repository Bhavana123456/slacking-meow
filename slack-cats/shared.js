// Shared by the popup and the content script: settings, timer maths, cat drawings.
var DEFAULTS = {
  running: false, startedAt: 0, focusMin: 25, breakMin: 5, mode: 'block',
  blockSites: ['youtube.com','instagram.com','facebook.com','x.com','twitter.com','reddit.com','netflix.com','tiktok.com','twitch.tv','primevideo.com','hotstar.com','9gag.com'],
  allowSites: ['github.com','stackoverflow.com','developer.mozilla.org','docs.google.com','claude.ai','leetcode.com','localhost']
};
function phaseOf(s){
  if(!s.running) return {phase:'idle', left:s.focusMin*60000};
  var f = s.focusMin*60000, b = s.breakMin*60000, pos = (Date.now()-s.startedAt) % (f+b);
  return pos < f ? {phase:'focus', left:f-pos} : {phase:'break', left:f+b-pos};
}
function fmt(ms){
  var s = Math.max(0, Math.ceil(ms/1000));
  return String(Math.floor(s/60)).padStart(2,'0') + ':' + String(s%60).padStart(2,'0');
}
var _n = 0, FUR = {black:'#111', white:'#fff', tux:'#111', spot:'#fff'};
function cat(v, mood){
  var id = ++_n, f = FUR[v];
  var eye = (v==='black'||v==='tux') ? '#fff' : '#111', nose = (v==='black') ? '#fff' : '#111';
  var head = 'M30 120 Q30 70 60 62 L52 18 L92 50 Q100 48 108 50 L148 18 L140 62 Q170 70 170 120 Q170 152 100 152 Q30 152 30 120Z';
  var body = 'M44 142 Q40 200 42 262 L158 262 Q160 200 156 142Z', extra = '';
  if(v==='tux') extra = '<g clip-path="url(#h'+id+')"><ellipse cx="100" cy="135" rx="30" ry="22" fill="#fff"/></g><g clip-path="url(#b'+id+')"><ellipse cx="100" cy="215" rx="24" ry="50" fill="#fff"/></g>';
  if(v==='spot') extra = '<g clip-path="url(#h'+id+')"><ellipse cx="58" cy="48" rx="36" ry="30" fill="#111"/><ellipse cx="156" cy="92" rx="18" ry="16" fill="#111"/></g><g clip-path="url(#b'+id+')"><ellipse cx="156" cy="205" rx="30" ry="42" fill="#111"/></g>';
  var eyes = '';
  if(mood==='wide') [70,130].forEach(function(x){eyes += '<circle cx="'+x+'" cy="108" r="15" fill="#fff" stroke="#111" stroke-width="4"/><circle cx="'+x+'" cy="108" r="6" fill="#111"/>';});
  else if(mood==='sleepy') [72,128].forEach(function(x){eyes += '<circle cx="'+x+'" cy="110" r="5" fill="'+eye+'"/>';});
  else eyes = '<path d="M58 108 Q70 120 82 108 M118 108 Q130 120 142 108" stroke="'+eye+'" stroke-width="4" fill="none" stroke-linecap="round"/>';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 262"><defs><clipPath id="h'+id+'"><path d="'+head+'"/></clipPath><clipPath id="b'+id+'"><path d="'+body+'"/></clipPath></defs>'
    + '<path d="'+body+'" fill="'+f+'" stroke="#111" stroke-width="6" stroke-linejoin="round"/>'
    + '<path d="'+head+'" fill="'+f+'" stroke="#111" stroke-width="6" stroke-linejoin="round"/>' + extra + eyes
    + '<path d="M93 124 L107 124 L100 133Z" fill="'+nose+'"/>'
    + '<path d="M100 133 Q100 140 92 141 M100 133 Q100 140 108 141" stroke="'+nose+'" stroke-width="3" fill="none" stroke-linecap="round"/></svg>';
}
function paw(){
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 240"><path d="M20 240 L20 70 Q20 20 60 20 Q100 20 100 70 L100 240Z" fill="#111" stroke="#111" stroke-width="6" stroke-linejoin="round"/><ellipse cx="60" cy="80" rx="20" ry="16" fill="#fff"/><ellipse cx="35" cy="52" rx="7" ry="9" fill="#fff"/><ellipse cx="60" cy="42" rx="7" ry="9" fill="#fff"/><ellipse cx="85" cy="52" rx="7" ry="9" fill="#fff"/></svg>';
}
