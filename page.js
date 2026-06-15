(function(){'use strict';
  var prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = matchMedia('(pointer: coarse)').matches;

  var TOOLS_1 = ['Kubernetes','Docker','Helm','Argo CD','GitHub Actions','Gateway API','kubectl','YAML','GitOps','K8sGPT','Ollama'];
  var TOOLS_2 = ['Pods & Deployments','ConfigMaps & Secrets','Services & DNS','Network Policies','Persistent Volumes','Taints & Tolerations','Probes & HPA','Rolling Updates','Blue-Green','Capstone Project'];

  function buildTrack(id, items){
    var track = document.getElementById(id);
    if(!track) return;
    var html = items.map(function(t){
      return '<div class="dm-chip"><span class="dm-chip__dot"></span>'+t+'</div>';
    }).join('');
    track.innerHTML = html + html + html; /* tripled for seamless loop */
  }

  function initMarquee(){
    buildTrack('marquee-row-1', TOOLS_1);
    buildTrack('marquee-row-2', TOOLS_2);
    var section = document.querySelector('.dm-marquee');
    var r1 = document.getElementById('marquee-row-1');
    var r2 = document.getElementById('marquee-row-2');
    if(!section || !r1 || !r2) return;
    /* Reduced-motion: chips are built and visible, but no scroll-driven movement. */
    if(prefersReduced) return;
    var sectionTop = section.getBoundingClientRect().top + window.scrollY;
    var ticking = false;
    function update(){
      var offset = (window.scrollY - sectionTop + window.innerHeight) * 0.3;
      r1.style.transform = 'translateX('+(offset - 200)+'px)';
      r2.style.transform = 'translateX('+(-(offset - 200))+'px)';
    }
    function recalc(){ sectionTop = section.getBoundingClientRect().top + window.scrollY; update(); }
    window.addEventListener('scroll', function(){
      if(ticking) return; ticking = true;
      requestAnimationFrame(function(){ update(); ticking = false; });
    }, {passive:true});
    window.addEventListener('resize', recalc, {passive:true});
    update();
  }

  function initCharReveal(){
    var nodes = document.querySelectorAll('[data-charreveal], #about-reveal');
    if(!nodes.length) return;
    nodes.forEach(function(node){
      var text = node.textContent;
      node.textContent = '';
      var frag = document.createDocumentFragment();
      var spans = [];
      for(var i=0;i<text.length;i++){
        var s = document.createElement('span');
        s.textContent = text[i];
        s.style.opacity = '0.2';
        s.style.transition = 'opacity .3s ease';
        if(text[i] === ' ') s.style.whiteSpace = 'pre';
        frag.appendChild(s); spans.push(s);
      }
      node.appendChild(frag);
      node._spans = spans;
    });
    if(prefersReduced || isTouch || window.innerWidth < 760){
      nodes.forEach(function(n){ n._spans.forEach(function(s){ s.style.opacity='1'; }); });
      return;
    }
    var ticking = false;
    function update(){
      nodes.forEach(function(node){
        var r = node.getBoundingClientRect();
        var vh = window.innerHeight;
        var start = vh * 0.8, end = vh * 0.2;
        var prog = (start - r.top) / (start - end + r.height);
        prog = Math.max(0, Math.min(1, prog));
        var lit = Math.floor(prog * node._spans.length);
        node._spans.forEach(function(s,i){ s.style.opacity = i < lit ? '1' : '0.2'; });
      });
    }
    window.addEventListener('scroll', function(){
      if(ticking) return; ticking = true;
      requestAnimationFrame(function(){ update(); ticking=false; });
    }, {passive:true});
    update();
  }

  function initStickyCards(){
    if(prefersReduced) return;
    var cards = Array.prototype.slice.call(document.querySelectorAll('.dm-card'));
    if(!cards.length) return;
    var total = cards.length, ticking = false, tops = [];
    cards.forEach(function(c){ c.style.willChange='transform'; });
    function measure(){ tops = cards.map(function(c){ return parseFloat(getComputedStyle(c).top) || 0; }); }
    function update(){
      cards.forEach(function(card,i){
        var targetScale = 1 - (total - 1 - i) * 0.03;
        var slot = card.parentElement.getBoundingClientRect();
        var prog = Math.max(0, Math.min(1, (tops[i] - slot.top) / slot.height));
        card.style.transform = 'scale('+(1 - (1 - targetScale) * prog)+')';
      });
    }
    measure();
    window.addEventListener('scroll', function(){
      if(ticking) return; ticking = true;
      requestAnimationFrame(function(){ update(); ticking=false; });
    }, {passive:true});
    window.addEventListener('resize', function(){ measure(); update(); }, {passive:true});
    update();
  }

  function init(){
    initMarquee();
    initCharReveal();
    initStickyCards();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
