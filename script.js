(function(){
  var g=document.getElementById('gh'),username='drewvicente';

  function renderGrid(levels,total){
    g.innerHTML='';
    for(var i=0;i<levels.length;i++){
      var c=document.createElement('i');
      if(levels[i])c.className='l'+levels[i];
      c.style.transitionDelay=(Math.floor(i/7)*12)+'ms';
      g.appendChild(c);
    }
    document.getElementById('ghn').textContent=(total||0).toLocaleString();
  }

  // Fallback: seeded random grid
  function fakeGrid(){
    var s=7,levels=[],tot=0;
    function r(){s=(s*9301+49297)%233280;return s/233280}
    for(var w=0;w<53;w++)for(var d=0;d<7;d++){
      var v=r(),l=v<.35?0:v<.6?1:v<.78?2:v<.92?3:4;
      if((d===0||d===6)&&r()<.5)l=0;
      if(l)tot+=Math.ceil(r()*l*4);
      levels.push(l);
    }
    renderGrid(levels,tot);
  }

  // Fetch real contributions via public CORS-friendly API
  fetch('https://github-contributions-api.jogruber.de/v4/'+username+'?y=last')
    .then(function(r){if(!r.ok)throw new Error(r.status);return r.json()})
    .then(function(data){
      var contribs=data.contributions||[];
      var total=data.total&&data.total.lastYear||0;
      // contribs is a flat array of {date,count,level} sorted by date
      // GitHub grid is 7 rows (Sun-Sat) × 53 cols (weeks), column-major
      // The API returns day-by-day in chronological order — already column-major friendly
      // We need exactly 371 cells (53×7); pad the start if needed
      var startDay=new Date(contribs[0].date).getDay(); // 0=Sun
      var levels=[];
      // Pad leading days of the first week
      for(var p=0;p<startDay;p++)levels.push(0);
      for(var i=0;i<contribs.length;i++){
        var lv=contribs[i].level||0;
        // API returns level 0-4, map directly
        levels.push(lv>4?4:lv);
      }
      // Pad trailing to fill last week
      while(levels.length%7!==0)levels.push(0);
      renderGrid(levels,total);
    })
    .catch(function(){fakeGrid()});

  // Show fallback immediately, replaced when fetch resolves
  fakeGrid();
})();
var root=document.documentElement;
(function(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
  root.classList.add('js');
  var els=document.querySelectorAll('.stat,section .head,section .card,section .row,.chips span,blockquote,.contact>*');
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting)return;
      var t=e.target;t.classList.add('in');io.unobserve(t);
      var b=t.querySelector&&t.querySelector('b[data-n]');
      if(b){var n=+b.dataset.n,s=b.dataset.s,st=null;
        (function f(ts){st=st||ts;var p=Math.min((ts-st)/1200,1);b.textContent=Math.round(n*(1-Math.pow(1-p,3)))+s;if(p<1)requestAnimationFrame(f)})(performance.now());}
    });
  },{threshold:.15});
  els.forEach(function(el,i){
    el.classList.add('reveal');
    if(el.parentElement.classList.contains('chips')){el.classList.add('chips-i');el.style.transitionDelay=(i%12)*50+'ms'}
    io.observe(el);
  });
  var bar=document.getElementById('bar');
  addEventListener('scroll',function(){
    var h=document.documentElement;
    bar.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight||1)*100)+'%';
  },{passive:true});
})();
document.getElementById('theme').onclick=function(){
  var dark=root.dataset.theme?root.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;
  var next=dark?'light':'dark';
  function apply(){root.dataset.theme=next}
  if(!document.startViewTransition||matchMedia('(prefers-reduced-motion: reduce)').matches){apply();return}
  var r=this.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
  var rad=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
  var t=document.startViewTransition(apply);
  t.ready.then(function(){
    document.documentElement.animate(
      {clipPath:['circle(0px at '+x+'px '+y+'px)','circle('+rad+'px at '+x+'px '+y+'px)']},
      {duration:700,easing:'ease-in-out',pseudoElement:'::view-transition-new(root)'}
    );
  });
};
document.getElementById('copy').onclick=function(){
  var b=this;
  try{navigator.clipboard.writeText('vicentecharlesandrew002@gmail.com')}catch(e){}
  b.textContent='Copied!';setTimeout(function(){b.textContent='Copy'},1500);
};