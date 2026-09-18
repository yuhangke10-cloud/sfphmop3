(() => {
  'use strict';

  const WIDTH = 1920;
  const HEIGHT = 1080;
  const screen = document.getElementById('screen');
  const passwordGate = document.getElementById('passwordGate');
  const passwordInput = document.getElementById('passwordInput');
  const controls = {
    monitorTab: document.getElementById('monitorTab'),
    eventTab: document.getElementById('eventTab'),
    parameterTab: document.getElementById('parameterTab'),
    mapLine: document.getElementById('mapLine'),
    mapSatellite: document.getElementById('mapSatellite'),
    mapNetwork: document.getElementById('mapNetwork'),
    themeToggle: document.getElementById('themeToggle'),
    drawChart: document.getElementById('drawChart'),
    parameterBack: document.getElementById('parameterBack')
  };

  const state = {
    page: 'monitor',
    parameterView: 'main',
    map: 'map',
    theme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  };

  const regions = {
    monitorTab: [162, 0, 224, 46],
    eventTab: [386, 0, 224, 46],
    parameterTab: [610, 0, 224, 46],
    mapLine: [1615, 71, 64, 39],
    mapSatellite: [1679, 71, 88, 39],
    mapNetwork: [1767, 71, 86, 39],
    themeToggle: [1815, 0, 54, 46],
    drawChart: [1790, 60, 108, 29],
    parameterBack: [1788, 59, 107, 29]
  };

  const allImages = [
    'light-line.png', 'light-map.png', 'light-net.png',
    'dark-line.png', 'dark-map.png', 'dark-net.png',
    'light-event.png', 'dark-event.png',
    'light-parameter-main.png', 'light-parameter-chart.png',
    'dark-parameter-main.png', 'dark-parameter-chart.png'
  ].map(name => `assets/images/${name}`);

  let assetsReady = false;
  let preloadPromise = null;
  const preloadCache = [];

  function preloadAllImages() {
    if (preloadPromise) return preloadPromise;
    const current = imagePath();
    const queue = [current, ...allImages.filter(path => path !== current)];
    preloadPromise = Promise.all(queue.map((path, index) => new Promise(resolve => {
      const image = new Image();
      image.decoding = 'async';
      image.fetchPriority = index === 0 ? 'high' : 'low';
      preloadCache.push(image);
      image.onload = resolve;
      image.onerror = resolve;
      image.src = path;
    }))).then(() => { assetsReady = true; });
    return preloadPromise;
  }

  function imagePath() {
    if (state.page === 'event') return `assets/images/${state.theme}-event.png`;
    if (state.page === 'parameter') return `assets/images/${state.theme}-parameter-${state.parameterView}.png`;
    return `assets/images/${state.theme}-${state.map}.png`;
  }

  function layout() {
    const scale = innerHeight / HEIGHT;
    const offsetX = (innerWidth - WIDTH * scale) / 2;
    Object.entries(regions).forEach(([name, [x, y, width, height]]) => {
      Object.assign(controls[name].style, {
        left: `${offsetX + x * scale}px`,
        top: `${y * scale}px`,
        width: `${width * scale}px`,
        height: `${height * scale}px`
      });
    });
  }

  function render() {
    screen.src = imagePath();
    document.documentElement.dataset.theme = state.theme;
    const monitorVisible = state.page === 'monitor';
    controls.drawChart.style.display = state.page === 'parameter' && state.parameterView === 'main' ? 'block' : 'none';
    controls.parameterBack.style.display = state.page === 'parameter' && state.parameterView === 'chart' ? 'block' : 'none';
    for (const name of ['mapLine', 'mapSatellite', 'mapNetwork']) {
      controls[name].style.display = monitorVisible ? 'block' : 'none';
    }
    controls.monitorTab.setAttribute('aria-pressed', String(state.page === 'monitor'));
    controls.eventTab.setAttribute('aria-pressed', String(state.page === 'event'));
    controls.parameterTab.setAttribute('aria-pressed', String(state.page === 'parameter'));
    controls.themeToggle.setAttribute('aria-label', state.theme === 'light' ? 'Switch to dark' : 'Switch to light');
    layout();
  }

  passwordInput.addEventListener('keydown', async event => {
    if (event.key !== 'Enter') return;
    if (passwordInput.value === '18817962338') {
      passwordInput.disabled = true;
      passwordInput.value = '';
      passwordInput.placeholder = assetsReady ? 'Ready' : 'Loading…';
      await preloadAllImages();
      render();
      await screen.decode().catch(() => {});
      passwordGate.classList.add('is-hidden');
      passwordGate.setAttribute('aria-hidden', 'true');
    } else {
      passwordInput.value = '';
      passwordInput.setAttribute('aria-invalid', 'true');
      passwordInput.focus();
    }
  });

  function switchPage(page) {
    state.page = page;
    if (page === 'parameter') state.parameterView = 'main';
    render();
  }

  controls.monitorTab.addEventListener('click', () => switchPage('monitor'));
  controls.eventTab.addEventListener('click', () => switchPage('event'));
  controls.parameterTab.addEventListener('click', () => switchPage('parameter'));
  controls.drawChart.addEventListener('click', () => { state.parameterView = 'chart'; render(); });
  controls.parameterBack.addEventListener('click', () => { state.parameterView = 'main'; render(); });
  controls.mapLine.addEventListener('click', () => { state.map = 'line'; render(); });
  // Match the selected label embedded in the original artwork, not the filename meaning.
  controls.mapSatellite.addEventListener('click', () => { state.map = 'net'; render(); });
  controls.mapNetwork.addEventListener('click', () => { state.map = 'map'; render(); });
  controls.themeToggle.addEventListener('click', () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    render();
  });

  addEventListener('resize', layout);
  preloadAllImages();
  render();
})();
