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
    document.getElementById('ghn').textContent=typeof total==='number'?total.toLocaleString():total;
  }

  // Render "drew" spelled across the 7x53 contribution grid
  function showDrewGrid(){
    var cols = [];
    // 15 empty columns on the left
    for(var i=0; i<15; i++) cols.push([0,0,0,0,0,0,0]);

    // 'd' (4 cols)
    cols.push([0,0,0,1,1,1,0]);
    cols.push([0,0,1,0,0,0,1]);
    cols.push([0,0,1,0,0,0,1]);
    cols.push([1,1,1,1,1,1,1]);

    // gap (2 cols)
    cols.push([0,0,0,0,0,0,0],[0,0,0,0,0,0,0]);

    // 'r' (4 cols)
    cols.push([0,0,1,1,1,1,1]);
    cols.push([0,0,0,1,0,0,0]);
    cols.push([0,0,1,0,0,0,0]);
    cols.push([0,0,1,0,0,0,0]);

    // gap (2 cols)
    cols.push([0,0,0,0,0,0,0],[0,0,0,0,0,0,0]);

    // 'e' (4 cols)
    cols.push([0,0,0,1,1,1,0]);
    cols.push([0,0,1,0,1,0,1]);
    cols.push([0,0,1,0,1,0,1]);
    cols.push([0,0,0,1,1,0,1]);

    // gap (2 cols)
    cols.push([0,0,0,0,0,0,0],[0,0,0,0,0,0,0]);

    // 'w' (5 cols)
    cols.push([0,0,1,1,1,1,0]);
    cols.push([0,0,0,0,0,0,1]);
    cols.push([0,0,0,0,1,1,0]);
    cols.push([0,0,0,0,0,0,1]);
    cols.push([0,0,1,1,1,1,0]);

    // 15 empty columns on the right
    while(cols.length < 53) cols.push([0,0,0,0,0,0,0]);

    // Flatten column-major into levels array
    var levels = [];
    for(var c=0; c<cols.length; c++){
      for(var r=0; r<7; r++){
        levels.push(cols[c][r] ? 4 : 0);
      }
    }
    renderGrid(levels, 'drew');
  }

  // Fetch real data in parallel
  var fetchData = fetch('https://github-contributions-api.jogruber.de/v4/'+username+'?y=last')
    .then(function(r){if(!r.ok)throw new Error(r.status);return r.json()})
    .catch(function(){return null});

  // Ensure "drew" is visible for at least 2.5s after the user actually scrolls to the graph
  var graphCard = document.querySelector('.graph');
  var seenPromise = new Promise(function(resolve){
    if(!('IntersectionObserver' in window)){
      setTimeout(resolve, 2500);
      return;
    }
    var io = new IntersectionObserver(function(entries){
      if(entries[0].isIntersecting){
        io.disconnect();
        setTimeout(resolve, 2500);
      }
    }, {threshold: 0.2});
    io.observe(graphCard);
  });

  // Once data is ready AND user has seen "drew" for 2.5s, smoothly transition to live contributions
  Promise.all([fetchData, seenPromise]).then(function(results){
    var data = results[0];
    if(!data) return;
    var contribs=data.contributions||[];
    var total=data.total&&data.total.lastYear||0;
    var startDay=new Date(contribs[0].date).getDay();
    var levels=[];
    for(var p=0;p<startDay;p++)levels.push(0);
    for(var i=0;i<contribs.length;i++){
      var lv=contribs[i].level||0;
      levels.push(lv>4?4:lv);
    }
    while(levels.length%7!==0)levels.push(0);

    g.style.transition = 'opacity .35s ease';
    g.style.opacity = '0.2';
    setTimeout(function(){
      renderGrid(levels, total);
      g.style.opacity = '1';
    }, 350);
  });

  // Show "drew" pixel grid immediately
  showDrewGrid();
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
  var dark=root.dataset.theme==='dark';
  var next=dark?'light':'dark';
  function apply(){
    root.dataset.theme=next;
    try{localStorage.setItem('theme',next)}catch(e){}
  }
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
document.querySelectorAll('#certs .card').forEach(function(card){
  card.addEventListener('click', function(e){
    var link = card.querySelector('a');
    if(link && e.target !== link){
      link.click();
    }
  });
});
document.getElementById('copy').onclick=function(){
  var b=this;
  try{navigator.clipboard.writeText('vicentecharlesandrew002@gmail.com')}catch(e){}
  b.textContent='Copied!';setTimeout(function(){b.textContent='Copy'},1500);
};