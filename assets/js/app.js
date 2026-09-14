'use strict';
const passwordGate=document.getElementById('passwordGate');
const passwordInput=document.getElementById('passwordInput');
passwordInput.addEventListener('keydown',event=>{
  if(event.key!=='Enter') return;
  if(passwordInput.value==='18817962338'){
    passwordGate.classList.add('is-hidden');
    passwordGate.setAttribute('aria-hidden','true');
  }else{
    passwordInput.value='';
    passwordInput.setAttribute('aria-invalid','true');
    passwordInput.focus();
  }
});

const screen=document.getElementById('screen');
let theme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light',mode='line';
// Coordinates measured on the supplied 7680 x 4320 exports.
const regions={theme:[7190,0,220,260],satellite:[3830,515,400,160],line:[4230,515,430,160],network:[4650,515,540,160]};
function layout(){const scale=innerHeight/4320,offset=(innerWidth-7680*scale)/2;for(const [id,[x,y,w,h]]of Object.entries(regions)){Object.assign(document.getElementById(id).style,{left:(offset+x*scale)+'px',top:y*scale+'px',width:w*scale+'px',height:h*scale+'px'});}}
function render(){screen.src='assets/images/'+theme+'-'+mode+'.png';document.documentElement.dataset.theme=theme;document.getElementById('theme').setAttribute('aria-label',theme==='light'?'Switch to dark theme':'Switch to light theme');for(const id of ['satellite','line','network'])document.getElementById(id).setAttribute('aria-pressed',String(id===mode));layout();}
document.getElementById('theme').onclick=()=>{theme=theme==='light'?'dark':'light';render();};
for(const id of ['satellite','line','network'])document.getElementById(id).onclick=()=>{mode=id;render();};
addEventListener('resize',layout);render();
