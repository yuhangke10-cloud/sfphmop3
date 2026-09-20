(() => {
  'use strict';
  const WIDTH = 1920, HEIGHT = 1080, PASSWORD = '18817962338';
  const screen = document.getElementById('screen');
  const passwordGate = document.getElementById('passwordGate');
  const passwordInput = document.getElementById('passwordInput');
  const controls = Object.fromEntries(['monitorTab','eventTab','parameterTab','theme','satellite','line','network','parameterQuery','parameterBack'].map(id => [id, document.getElementById(id)]));
  const state = {theme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light', page: 'monitor', mode: 'line', parameterView: 'main'};
  // Rectangles measured on the latest exports, expressed at 2048 x 1152.
  const regions = {
    monitorTab:[247,20,278,47], eventTab:[533,20,278,47], parameterTab:[819,20,278,47], theme:[1932,23,44,40],
    satellite:[1073,138,100,35], line:[1186,138,73,35], network:[1272,138,103,35],
    parameterQuery:[1920,83,102,35], parameterBack:[1920,83,102,35]
  };
  const allImages = ['light-line.png','light-satellite.png','light-network.png','dark-line.png','dark-satellite.png','dark-network.png','light-event.png','dark-event.png','light-parameter-main.png','dark-parameter-main.png','light-parameter-result.png','dark-parameter-result.png'].map(name => `assets/images/${name}`);
  let preloadPromise;
  const preloadCache = [];
  function imagePath(){
    if(state.page === 'event') return `assets/images/${state.theme}-event.png`;
    if(state.page === 'parameter') return `assets/images/${state.theme}-parameter-${state.parameterView}.png`;
    return `assets/images/${state.theme}-${state.mode}.png`;
  }
  function preloadAllImages(){
    if(preloadPromise) return preloadPromise;
    const current = imagePath(), queue = [current, ...allImages.filter(path => path !== current)];
    preloadPromise = Promise.all(queue.map((path,index) => new Promise(resolve => {
      const image = new Image(); image.decoding = 'async'; image.fetchPriority = index === 0 ? 'high' : 'low';
      image.onload = resolve; image.onerror = resolve; image.src = path; preloadCache.push(image);
    })));
    return preloadPromise;
  }
  function layout(){
    const rect=screen.getBoundingClientRect();
    const active={...regions};
    if(state.theme==='dark') Object.assign(active,{
      satellite:[1094,138,92,35],line:[1199,138,68,35],network:[1280,138,95,35],
      parameterQuery:[1905,87,118,35],parameterBack:[1905,87,118,35]
    });
    Object.entries(active).forEach(([id,[x,y,w,h]]) => Object.assign(controls[id].style,{
      left:`${rect.left+x*rect.width/2048}px`,top:`${rect.top+y*rect.height/1152}px`,
      width:`${w*rect.width/2048}px`,height:`${h*rect.height/1152}px`,borderRadius:'6px'
    }));
  }
  function setVisible(id,visible){controls[id].style.display=visible?'block':'none';controls[id].style.pointerEvents=visible?'auto':'none';}
  function render(){
    screen.src=imagePath(); document.documentElement.dataset.theme=state.theme;
    const monitoring=state.page==='monitor';
    for(const id of ['satellite','line','network']) setVisible(id,monitoring);
    setVisible('parameterQuery',state.page==='parameter'&&state.parameterView==='main');
    setVisible('parameterBack',state.page==='parameter'&&state.parameterView==='result');
    controls.monitorTab.setAttribute('aria-pressed',String(state.page==='monitor'));
    controls.eventTab.setAttribute('aria-pressed',String(state.page==='event'));
    controls.parameterTab.setAttribute('aria-pressed',String(state.page==='parameter'));
    controls.theme.setAttribute('aria-label',state.theme==='light'?'Switch to dark theme':'Switch to light theme');
    layout();
  }
  function switchPage(page){state.page=page;if(page==='parameter')state.parameterView='main';render();}
  passwordInput.addEventListener('keydown',async event=>{
    if(event.key!=='Enter')return;
    if(passwordInput.value!==PASSWORD){passwordInput.value='';passwordInput.setAttribute('aria-invalid','true');passwordInput.focus();return;}
    passwordInput.disabled=true; await preloadAllImages(); render(); await screen.decode().catch(()=>{});
    passwordGate.classList.add('is-hidden'); passwordGate.setAttribute('aria-hidden','true');
  });
  controls.monitorTab.addEventListener('click',()=>switchPage('monitor'));
  controls.eventTab.addEventListener('click',()=>switchPage('event'));
  controls.parameterTab.addEventListener('click',()=>switchPage('parameter'));
  controls.theme.addEventListener('click',()=>{state.theme=state.theme==='light'?'dark':'light';render();});
  for(const id of ['satellite','line','network']) controls[id].addEventListener('click',()=>{state.mode=id;render();});
  controls.parameterQuery.addEventListener('click',()=>{state.parameterView='result';render();});
  controls.parameterBack.addEventListener('click',()=>{state.parameterView='main';render();});
  screen.addEventListener('load',layout);
  new ResizeObserver(layout).observe(screen);
  addEventListener('resize',layout); preloadAllImages(); render();
})();
