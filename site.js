(function(){
  function normalize(s){ return (s||'').toLowerCase(); }
function rootBase(){
    var depth = window.FRONTERA_DEPTH||0;
    var parts = window.location.pathname.split('/');
    // Remove the filename and 'depth' directory segments
    parts = parts.slice(0, parts.length - 1 - depth);
    return parts.join('/') + '/';
}
function init(){
    var input = document.getElementById('site-search');
    var box   = document.getElementById('search-results');
    if(!input||!box) return;
    // Move box to body so it's never clipped by any ancestor overflow
    document.body.appendChild(box);
    function reposition(){
      var r = input.getBoundingClientRect();
      box.style.top  = (r.bottom + 6) + 'px';
      box.style.left = r.left + 'px';
      box.style.width = r.width + 'px';
    }
    input.addEventListener('input', function(){ reposition(); renderResults(input.value, box); });
    input.addEventListener('focus', function(){ reposition(); if(input.value.trim()) renderResults(input.value, box); });
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    document.addEventListener('click', function(e){ if(!box.contains(e.target)&&e.target!==input){ box.classList.add('hidden'); } });
    input.addEventListener('keydown', function(e){ if(e.key==='Escape'){ box.classList.add('hidden'); input.blur(); } });
}
  function renderResults(query, box){
    if(!window.FRONTERA_SEARCH_INDEX){ box.classList.add('hidden'); return; }
    var base = rootBase();
    var q = normalize(query).trim();
    if(!q){ box.classList.add('hidden'); return; }
    var parts = q.split(/\s+/).filter(Boolean);
    var results = window.FRONTERA_SEARCH_INDEX
      .map(function(e){
        var hay = normalize(e.title+' '+e.text);
        var score = hay.includes(q) ? 20 : 0;
        parts.forEach(function(p){ if(hay.includes(p)) score += 3; });
        if(normalize(e.title).includes(q)) score += 10;
        return {entry:e, score:score};
      })
      .filter(function(x){ return x.score>0; })
      .sort(function(a,b){ return b.score-a.score||a.entry.title.localeCompare(b.entry.title); })
      .slice(0,18);
    if(!results.length){
      box.innerHTML='<div class="search-result"><span class="muted-text">No matches found.</span></div>';
    } else {
      box.innerHTML = results.map(function(r){
        var meta = (r.entry.text||'').replace(/[<>]/g,'').substring(0,80);
        return '<div class="search-result"><a href="'+base+r.entry.url+'">'+r.entry.title+'</a><div class="sr-meta">'+meta+'</div></div>';
      }).join('');
    }
    box.classList.remove('hidden');
    box.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ box.classList.add('hidden'); }); });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
