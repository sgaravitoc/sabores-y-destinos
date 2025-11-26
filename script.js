/* ===========================
   UTILIDADES Y CONFIG
   =========================== */

// Utility function for debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Theme toggle (light / dark) persisted in localStorage
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;
const storedTheme = localStorage.getItem('site-theme');

if (storedTheme) html.setAttribute('data-theme', storedTheme);
else {
  // detect prefers-color-scheme
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark) html.setAttribute('data-theme','dark');
}

function updateThemeUI(){
  const isDark = html.getAttribute('data-theme') === 'dark';
  themeToggle.textContent = isDark ? '☀️' : '🌙';
}
updateThemeUI();

themeToggle?.addEventListener('click', () => {
  const current = html.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('site-theme', next);
  updateThemeUI();
});

// reset theme button (on contact form)
document.getElementById('reset-theme')?.addEventListener('click', () => {
  localStorage.removeItem('site-theme');
  html.removeAttribute('data-theme');
  updateThemeUI();
});

/* ===========================
   MOBILE NAV TOGGLE
   =========================== */
const menuToggle = document.getElementById('menu-toggle');
const nav = document.getElementById('main-nav');
menuToggle?.addEventListener('click', () => {
  nav.classList.toggle('open');
  menuToggle.classList.toggle('open');
  const expanded = menuToggle.classList.contains('open');
  menuToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
});

/* ===========================
   SCROLL REVEAL
   =========================== */
function revealOnScroll(){
  document.querySelectorAll('.reveal').forEach(el=>{
    const top = el.getBoundingClientRect().top;
    if (top < window.innerHeight - 80) el.classList.add('active');
  });
}
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

/* ===========================
   HEADER SHOW/HIDE ON SCROLL
   =========================== */
let lastScroll = 0;
const header = document.querySelector('.site-header');
window.addEventListener('scroll', ()=>{
  const current = window.pageYOffset;
  if (current > lastScroll && current > 60) header.style.top = '-90px';
  else header.style.top = '0';
  lastScroll = current;
});

/* ===========================
   HOVER SOUND (Web Audio API)
   =========================== */
const audioCtx = (typeof AudioContext !== 'undefined') ? new AudioContext() : null;
function playHoverSound(){
  if (!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(420, audioCtx.currentTime);
  g.gain.setValueAtTime(0.0015, audioCtx.currentTime);
  o.connect(g); g.connect(audioCtx.destination);
  o.start();
  o.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12);
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);
  o.stop(audioCtx.currentTime + 0.13);
}

/* attach hover sound to interactive cards */
document.querySelectorAll('.card.interactive').forEach(card => {
  card.addEventListener('mouseenter', () => {
    // resume context if suspended (some browsers require user gesture)
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    playHoverSound();
    card.classList.add('hovered');
  });
  card.addEventListener('mouseleave', () => card.classList.remove('hovered'));
});

/* ===========================
   TESTIMONIALS CAROUSEL (INDEX)
   =========================== */
(function testimonialCarousel(){
  const wrap = document.getElementById('testi-carousel');
  if (!wrap) return;
  const slides = Array.from(wrap.children);
  let idx = 0;
  function show(i){
    slides.forEach((s,si)=> s.style.transform = `translateX(${(si - i) * 100}%)`);
  }
  show(0);
  setInterval(()=>{ idx = (idx + 1) % slides.length; show(idx); }, 3500);
})();

/* ===========================
   PRESENTATION MODE - SIMULATED CUBE EFFECT
   =========================== */

let currentSlide = 'front';
let isPresentationMode = false;
let isTransitioning = false;

// Presentation mode toggle
const presentationToggle = document.getElementById('cube-mode-toggle');
const presentationScene = document.getElementById('cube-scene');
const presentationContainer = document.getElementById('cube-container');
const miniOrientationCube = document.getElementById('mini-orientation-cube');

// Initialize presentation mode
presentationToggle?.addEventListener('click', enterPresentationMode);

function togglePresentationMode() {
  isPresentationMode = !isPresentationMode;
  
  if (isPresentationMode) {
    // Enter presentation mode
    body.classList.add('presentation-mode');
    presentationScene.style.display = 'block';
    miniOrientationCube.style.display = 'block';
    presentationScene.className = 'presentation-scene';
    presentationContainer.className = 'presentation-container';
    
    // Hide toggle button during transitions (except on first slide)
    presentationToggle.style.opacity = '0.3';
    presentationToggle.style.pointerEvents = 'none';
    
    // Convert cube faces to presentation slides
    const faces = presentationContainer.querySelectorAll('.cube-face');
    faces.forEach(face => {
      face.classList.remove('cube-face');
      face.classList.add('presentation-slide');
    });
    
    // Ocultar contenido principal al entrar en modo presentación
    const mainContent = document.getElementById('main');
    const headerContent = document.querySelector('header');
    if (mainContent) {
      mainContent.style.display = 'none';
      if (headerContent) headerContent.style.display = 'none';
      console.log('📄 Contenido principal oculto - modo presentación activado');
    }
    
    // Initialize cube features
    initCubeGame();
    initCubeContactForm();
    initCubeTestimonials();

    // Initialize first slide
    setTimeout(() => {
      showSlide('front');
      // Show toggle button again on first slide
      presentationToggle.style.opacity = '1';
      presentationToggle.style.pointerEvents = 'auto';
      // Initialize mini cube drag functionality
      initMiniCubeDrag();
    }, 100);
    
    presentationToggle.style.display = 'none';
    
    console.log('✅ Modo presentación activado - con mini cubo de orientación');
  } else {
    // Exit presentation mode
    body.classList.remove('presentation-mode');
    presentationScene.style.display = 'none';
    miniOrientationCube.style.display = 'none';
    
    // Show toggle button again
    presentationToggle.style.opacity = '1';
    presentationToggle.style.pointerEvents = 'auto';
    
    // Convert back to cube faces if needed
    const slides = presentationContainer.querySelectorAll('.presentation-slide');
    slides.forEach(slide => {
      slide.classList.remove('presentation-slide', 'active');
      slide.classList.add('cube-face');
    });
    
    // Mostrar contenido principal al salir del modo presentación
    const mainContent = document.getElementById('main');
    const headerContent = document.querySelector('header');
    if (mainContent) {
      mainContent.style.display = 'block';
      if (headerContent) headerContent.style.display = 'block';
      console.log('📄 Contenido principal mostrado - modo presentación desactivado');
    }
    
    presentationToggle.style.display = 'inline-block';
    presentationToggle.textContent = 'Pulsa aquí';
    presentationToggle.title = 'Activar modo presentación';
    
    console.log('📄 Modo presentación desactivado');
  }
}

function enterPresentationMode() {
  if (!isPresentationMode) {
    togglePresentationMode();
  }
}
function exitPresentationToMain() {
  if (!isPresentationMode || isTransitioning) return;
  togglePresentationMode();
}

// Kaleidoscope effect for presentation mode homepage
let kaleidoscopeSketch = function(p) {
  let symmetry = 6;
  let angle = 360 / symmetry;
  let mx, my;
  let pmx, pmy;
  
  p.setup = function() {
    const container = document.getElementById('kaleidoscope-container');
    if (!container) return;
    
    const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    canvas.parent('kaleidoscope-container');
    p.angleMode(p.DEGREES);
    p.background(20, 20, 30);
    
    mx = p.width / 2;
    my = p.height / 2;
    pmx = mx;
    pmy = my;
  };
  
  p.draw = function() {
    p.translate(p.width / 2, p.height / 2);
    
    if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
      mx = p.mouseX - p.width / 2;
      my = p.mouseY - p.height / 2;
      pmx = p.pmouseX - p.width / 2;
      pmy = p.pmouseY - p.height / 2;
    }
    
    // Draw kaleidoscope pattern
    for (let i = 0; i < symmetry; i++) {
      p.rotate(angle);
      
      // Main line
      p.strokeWeight(2);
      p.stroke(100 + i * 30, 150 + i * 15, 200 + i * 10, 150);
      p.line(pmx, pmy, mx, my);
      
      // Mirror line
      p.push();
      p.scale(1, -1);
      p.line(pmx, pmy, mx, my);
      p.pop();
      
      // Additional decorative lines
      p.strokeWeight(1);
      p.stroke(200 + i * 10, 100 + i * 20, 150 + i * 15, 100);
      p.line(pmx * 0.5, pmy * 0.5, mx * 0.5, my * 0.5);
      
      // Mirror decorative lines
      p.push();
      p.scale(1, -1);
      p.line(pmx * 0.5, pmy * 0.5, mx * 0.5, my * 0.5);
      p.pop();
    }
    
    // Add some animated circles for more visual interest
    p.noStroke();
    for (let i = 0; i < symmetry; i++) {
      p.rotate(angle);
      
      let size = 10 + p.sin(p.frameCount * 0.02 + i) * 5;
      p.fill(255, 100 + i * 20, 150 + i * 15, 80);
      p.ellipse(mx * 0.8, my * 0.8, size, size);
      
      // Mirror circles
      p.push();
      p.scale(1, -1);
      p.ellipse(mx * 0.8, my * 0.8, size, size);
      p.pop();
    }
  };
  
  p.windowResized = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.background(20, 20, 30);
  };
};

// Initialize kaleidoscope when in presentation mode
let kaleidoscopeP5;

function initKaleidoscope() {
  const container = document.getElementById('kaleidoscope-container');
  if (container && !kaleidoscopeP5) {
    kaleidoscopeP5 = new p5(kaleidoscopeSketch);
  }
}

function removeKaleidoscope() {
  if (kaleidoscopeP5) {
    kaleidoscopeP5.remove();
    kaleidoscopeP5 = null;
  }
}

function showSlide(slideName) {
  if (isTransitioning || !isPresentationMode) return;
  
  isTransitioning = true;
  const transitionClass = `slide-transition-to-${slideName}`;
  
  // Hide toggle button during transition
  presentationToggle.style.opacity = '0.3';
  presentationToggle.style.pointerEvents = 'none';
  
  // Remove previous transitions
  presentationContainer.className = 'presentation-container';
  
  // Get current active slide and target slide
  const currentActiveSlide = presentationContainer.querySelector('.presentation-slide.active');
  const targetSlide = presentationContainer.querySelector(`.presentation-slide.${slideName}`);
  
  if (!targetSlide) {
    isTransitioning = false;
    presentationToggle.style.opacity = '1';
    presentationToggle.style.pointerEvents = 'auto';
    return;
  }
  
  // Remove active class from current slide first
  if (currentActiveSlide) {
    currentActiveSlide.classList.remove('active');
  }
  
  // Mantener el contenido principal oculto en todo el modo presentación
  const mainContent = document.getElementById('main');
  const headerContent = document.querySelector('header');
  if (mainContent) {
    mainContent.style.display = 'none';
    if (headerContent) headerContent.style.display = 'none';
  }
  
  // Add transition class to container to start exit animation
  setTimeout(() => {
    presentationContainer.classList.add(transitionClass);
    
    // After exit animation completes, activate new slide
      setTimeout(() => {
        targetSlide.classList.add('active');
        
        // Update navigation
        updatePresentationNavigation(slideName);
        
        // Update mini orientation cube
        if (miniOrientationCube) {
          miniOrientationCube.setAttribute('data-slide', slideName);
        }
        
        // Initialize or remove kaleidoscope based on slide
        if (slideName === 'front') {
          initKaleidoscope();
        } else {
          removeKaleidoscope();
        }
        
        // Play transition sound
        playTransitionSound();
        
        currentSlide = slideName;
        
        // Clean up after transition completes
        setTimeout(() => {
          presentationContainer.className = 'presentation-container';
          isTransitioning = false;
          
          // Show toggle button again after transition
          presentationToggle.style.opacity = '1';
          presentationToggle.style.pointerEvents = 'auto';
        }, 1200); // Timing optimizado para transiciones suaves sin retraso excesivo
    }, 400); // Timing reducido para transiciones más fluidas
  }, 50);
}

function updatePresentationNavigation(slideName) {
  // Update active navigation button
  const navButtons = document.querySelectorAll('.presentation-nav-btn');
  navButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.slide === slideName);
  });
}

function playTransitionSound() {
  // Create a simple sound effect
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    console.log('Audio context not available:', error);
  }
}

// Keyboard navigation for presentation mode (including arrow controls for mini cube)
document.addEventListener('keydown', (e) => {
  if (!isPresentationMode || isTransitioning) return;
  
  // Desactivar flechas si estamos en el slide del juego 2048 (data-slide="left")
  if (currentSlide === 'left' && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
    console.log('🎮 Flechas desactivadas - estás en el juego 2048');
    return;
  }
  
  switch (e.key) {
    case 'ArrowLeft':
      e.preventDefault();
      rotateMiniCube('left');
      setTimeout(() => navigateMiniCube('left'), 150);
      break;
    case 'ArrowRight':
      e.preventDefault();
      rotateMiniCube('right');
      setTimeout(() => navigateMiniCube('right'), 150);
      break;
    case 'ArrowUp':
      e.preventDefault();
      rotateMiniCube('top');
      setTimeout(() => navigateMiniCube('top'), 150);
      break;
    case 'ArrowDown':
      e.preventDefault();
      rotateMiniCube('bottom');
      setTimeout(() => navigateMiniCube('bottom'), 150);
      break;
    case 'b':
    case 'B':
      e.preventDefault();
      showSlide('back');
      break;
    case 'f':
    case 'F':
      e.preventDefault();
      showSlide('front');
      break;
    case 'Escape':
      e.preventDefault();
      togglePresentationMode();
      break;
  }
});

// Mini cube navigation function
function navigateMiniCube(direction) {
  if (!isPresentationMode || isTransitioning) return;
  
  // Mapa de navegación del mini cubo basado en la dirección actual
  const navigationMap = {
    'front': {
      'left': 'left',
      'right': 'right',
      'top': 'top',
      'bottom': 'bottom'
    },
    'back': {
      'left': 'right',
      'right': 'left',
      'top': 'top',
      'bottom': 'bottom'
    },
    'left': {
      'left': 'back',
      'right': 'front',
      'top': 'top',
      'bottom': 'bottom'
    },
    'right': {
      'left': 'front',
      'right': 'back',
      'top': 'top',
      'bottom': 'bottom'
    },
    'top': {
      'left': 'left',
      'right': 'right',
      'top': 'back',
      'bottom': 'front'
    },
    'bottom': {
      'left': 'left',
      'right': 'right',
      'top': 'front',
      'bottom': 'back'
    }
  };
  
  const nextSlide = navigationMap[currentSlide]?.[direction];
  if (nextSlide) {
    showSlide(nextSlide);
  }
}

// Función para rotar el mini cubo visualmente (sin cambiar de slide)
function rotateMiniCube(direction) {
  if (!miniOrientationCube || isTransitioning) return;
  
  const miniCube = miniOrientationCube.querySelector('.mini-cube');
  if (!miniCube) return;
  
  // Rotar temporalmente el cubo para dar feedback visual
  const rotations = {
    'left': 'rotateY(-15deg)',
    'right': 'rotateY(15deg)',
    'top': 'rotateX(-15deg)',
    'bottom': 'rotateX(15deg)'
  };
  
  miniCube.style.transform = rotations[direction] || '';
  
  // Restablecer después de un breve momento
  setTimeout(() => {
    if (!isDragging) {
      miniCube.style.transform = '';
    }
  }, 200);
}

// Variables para el arrastre del mini cubo
let isDragging = false;
let startX = 0;
let startY = 0;
let currentX = 0;
let currentY = 0;

// Función para manejar el arrastre del mini cubo
function initMiniCubeDrag() {
  if (!miniOrientationCube) return;
  
  const miniCube = miniOrientationCube.querySelector('.mini-cube');
  if (!miniCube) return;
  
  // Mouse events
  miniOrientationCube.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', endDrag);
  
  // Touch events para móviles
  miniOrientationCube.addEventListener('touchstart', startDrag);
  document.addEventListener('touchmove', drag);
  document.addEventListener('touchend', endDrag);
  
  function startDrag(e) {
    if (!isPresentationMode || isTransitioning) return;
    
    isDragging = true;
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    
    startX = clientX;
    startY = clientY;
    
    miniOrientationCube.style.cursor = 'grabbing';
    miniOrientationCube.style.transform = 'scale(1.1)';
    miniOrientationCube.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
    e.preventDefault();
  }
  
  function drag(e) {
    if (!isDragging) return;
    
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    
    currentX = clientX - startX;
    currentY = clientY - startY;
    
    // Rotar el cubo visualmente mientras se arrastra
    const rotateY = currentX * 0.5;
    const rotateX = -currentY * 0.5;
    miniCube.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    
    e.preventDefault();
  }
  
  function endDrag(e) {
    if (!isDragging) return;
    
    isDragging = false;
    miniOrientationCube.style.cursor = 'grab';
    miniOrientationCube.style.transform = '';
    miniOrientationCube.style.boxShadow = '';
    
    // Determinar la dirección del arrastre
    const threshold = 30; // Mínimo de píxeles para considerar un arrastre
    let direction = null;
    
    if (Math.abs(currentX) > Math.abs(currentY)) {
      // Arrastre horizontal
      direction = currentX > threshold ? 'right' : currentX < -threshold ? 'left' : null;
    } else {
      // Arrastre vertical
      direction = currentY > threshold ? 'bottom' : currentY < -threshold ? 'top' : null;
    }
    
    // Restablecer la posición del cubo
    miniCube.style.transform = '';
    
    // Navegar si hay una dirección válida
    if (direction) {
      navigateMiniCube(direction);
    }
    
    // Resetear coordenadas
    currentX = 0;
    currentY = 0;
  }
}

// Initialize presentation navigation
document.addEventListener('DOMContentLoaded', () => {
  // Convert cube navigation to presentation navigation
  const cubeNav = document.querySelector('.cube-nav');
  if (cubeNav) {
    cubeNav.classList.remove('cube-nav');
    cubeNav.classList.add('presentation-nav');
    
    // Update buttons
    const buttons = cubeNav.querySelectorAll('.cube-nav-btn');
    buttons.forEach(btn => {
      btn.classList.remove('cube-nav-btn');
      btn.classList.add('presentation-nav-btn');
      
      // Update click handlers
      const face = btn.dataset.face;
      btn.addEventListener('click', () => {
        if (isPresentationMode) {
          showSlide(face);
        }
      });
    });
  }
  
  console.log('🎯 Sistema de presentación inicializado');
  console.log('🎮 Controles:');
  console.log('   - Botones con emojis: Navegar entre secciones');
  console.log('   - Flechas del teclado: Mover el mini cubo');
  console.log('   - Arrastrar mini cubo: Cambiar de sección');
  console.log('   - F: Ir al slide frontal (Inicio)');
  console.log('   - B: Ir al slide trasero (Nosotros)');
  console.log('   - ESC: Salir del modo presentación');
  const nosotrosAudio = document.getElementById('nosotros-audio');
  const nosotrosPlayBtn = document.getElementById('nosotros-play');
  const nosotrosProgress = document.getElementById('nosotros-progress');
  const nosotrosProgressFill = document.getElementById('nosotros-progress-fill');
  if (nosotrosAudio && nosotrosPlayBtn) {
    const updatePlayBtn = () => { nosotrosPlayBtn.textContent = nosotrosAudio.paused ? '▶' : '⏸'; };
    nosotrosPlayBtn.addEventListener('click', () => {
      if (nosotrosAudio.paused) nosotrosAudio.play(); else nosotrosAudio.pause();
    });
    nosotrosAudio.addEventListener('play', updatePlayBtn);
    nosotrosAudio.addEventListener('pause', updatePlayBtn);
    nosotrosAudio.addEventListener('ended', updatePlayBtn);
    updatePlayBtn();
    const updateProgress = () => {
      if (!nosotrosProgressFill || !nosotrosAudio.duration) return;
      const pct = (nosotrosAudio.currentTime / nosotrosAudio.duration) * 100;
      nosotrosProgressFill.style.width = pct + '%';
    };
    nosotrosAudio.addEventListener('timeupdate', updateProgress);
    nosotrosAudio.addEventListener('loadedmetadata', updateProgress);
    if (nosotrosProgress && nosotrosProgressFill) {
      nosotrosProgress.addEventListener('click', (e) => {
        const rect = nosotrosProgress.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pct = Math.min(Math.max(x / rect.width, 0), 1);
        if (nosotrosAudio.duration) nosotrosAudio.currentTime = pct * nosotrosAudio.duration;
      });
    }
  }
});

/* ===========================
   3D CUBE NAVIGATION
   =========================== */

let currentFace = 'front';
let isCubeMode = false;
let currentZoom = 1;
let isZoomedOut = false;

// Cube mode toggle
const cubeModeToggle = document.getElementById('cube-mode-toggle');
const cubeScene = document.getElementById('cube-scene');
const cubeContainer = document.getElementById('cube-container');
const body = document.body;



// Add welcome message
window.addEventListener('load', () => {
  console.log('🧊 ¡Bienvenido a Sabores y Destinos!');
  console.log('💡 Haz clic en el botón "Pulsa aquí" para activar el modo presentación');
  console.log('🎮 Haz clic en los botones con emojis para navegar por las secciones');
  console.log('🎯 Cada slide representa una sección diferente del sitio');
  console.log('✨ Ilusión de cubo sin complejidad 3D:');
  console.log('   - Transiciones suaves que simulan movimiento de cubo');
  console.log('   - Efectos visuales sin usar transformaciones 3D');
  console.log('   - Mejor rendimiento y compatibilidad');
  console.log('⌨️ Atajos de teclado (solo teclas específicas):');
  console.log('   - Flechas : Mover el mini cubo y cambiar de sección');
  console.log('   - F : Ir al slide frontal (Inicio)');
  console.log('   - B : Ir al slide trasero (Nosotros)');
  console.log('   - ESC : Salir del modo presentación');
  console.log('🖱️ Arrastre : Puedes arrastrar el mini cubo con el mouse');
  console.log('🎮 El juego 2048 aún usa flechas cuando está activo');
  
  // Initialize main carousel
  // initMainCarousel(); // Called at the end of the file
});

function toggleCubeMode() {
  isCubeMode = !isCubeMode;
  
  if (isCubeMode) {
    // Enter cube mode
    body.classList.add('cube-mode');
    cubeScene.style.display = 'block';
    
    console.log('Entering cube mode...');
    
    // Initialize cube navigation
    initializeCubeNavigation();
    
    // Initialize cube carousel
    initCubeCarousel();
    
    // Initialize cube game
    initCubeGame();
    
    // Initialize cube contact form
    initCubeContactForm();
    
    // Initialize cube testimonials
  initCubeTestimonials();
  
  // Auto-align the cube when entering cube mode
  setTimeout(() => {
    autoAlignCube();
    rotateCube('front');
  }, 100);
  
  // Add window resize handler for automatic re-alignment
  window.addEventListener('resize', debounce(() => {
    if (isCubeMode) {
      autoAlignCube();
      // Re-rotate to current face after realignment
      setTimeout(() => {
        rotateCube(currentFace);
      }, 300);
    }
  }, 250));
  
  // Update toggle button
    cubeModeToggle.textContent = '📄';
    cubeModeToggle.title = 'Desactivar modo cubo';
    
    console.log('Cube mode activated successfully');
  } else {
    // Exit cube mode
    body.classList.remove('cube-mode');
    cubeScene.style.display = 'none';
    
    // Update toggle button
    cubeModeToggle.textContent = '🧊';
    cubeModeToggle.title = 'Activar modo cubo';
    
    console.log('Cube mode deactivated');
  }
}

// Sistema de alineación automática - La máquina ajusta el cubo perfectamente al centro de la página
function autoAlignCube() {
  if (!isCubeMode) return;
  
  // Mostrar indicador de alineación
  showAutoAlignIndicator();
  
  // Detectar el tamaño de la ventana y ajustar el cubo
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Calcular el centro de la ventana
  const centerX = viewportWidth / 2;
  const centerY = viewportHeight / 2;
  
  console.log('🎯 Center point:', centerX, ',', centerY);
  
  // Ajustar el perspective para una vista perfecta centrada
  const scene = document.querySelector('.cube-scene');
  if (scene) {
    const optimalPerspective = Math.max(viewportWidth, viewportHeight) * 1.5;
    scene.style.perspective = `${optimalPerspective}px`;
    scene.style.perspectiveOrigin = '50% 50%';
    console.log('🎨 Perspective set to:', optimalPerspective, 'px');
  }
  
  // Forzar alineación perfecta del cubo al centro de la página
  setTimeout(() => {
    if (cubeContainer) {
      // Aplicar transformación con alineación perfecta al centro
      const currentRotation = getCurrentRotation();
      cubeContainer.style.transform = `${currentRotation} translateX(0) translateY(0) translateZ(0) scale(1)`;
      cubeContainer.style.transformOrigin = 'center center';
      cubeContainer.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
      
      // Asegurar que el cubo esté perfectamente centrado en la página
      cubeContainer.style.left = '50%';
      cubeContainer.style.top = '50%';
      cubeContainer.style.width = '100vw';
      cubeContainer.style.height = '100vh';
      
      console.log('✅ Cubo alineado automáticamente al centro de la página');
    }
    
    hideAutoAlignIndicator();
  }, 500);
}

function showAutoAlignIndicator() {
  const indicator = document.getElementById('auto-align-status');
  if (indicator) {
    indicator.style.display = 'flex';
    indicator.style.opacity = '1';
  }
}

function hideAutoAlignIndicator() {
  const indicator = document.getElementById('auto-align-status');
  if (indicator) {
    setTimeout(() => {
      indicator.style.opacity = '0';
      setTimeout(() => {
        indicator.style.display = 'none';
      }, 300);
    }, 1000);
  }
}

function updateZoomStatus() {
  // Ahora muestra el estado de alineación en lugar de zoom
  const zoomStatus = document.getElementById('zoom-status');
  if (zoomStatus) {
    zoomStatus.textContent = '✓'; // Indicador de alineación perfecta
  }
}

function getCurrentRotation() {
  // Get the current rotation based on the current face - centered rotation
  switch (currentFace) {
    case 'front':
      return 'translate(-50%, -50%) rotateX(0deg) rotateY(0deg) rotateZ(0deg)';
    case 'back':
      return 'translate(-50%, -50%) rotateX(0deg) rotateY(180deg) rotateZ(0deg)';
    case 'right':
      return 'translate(-50%, -50%) rotateX(0deg) rotateY(-90deg) rotateZ(0deg)';
    case 'left':
      return 'translate(-50%, -50%) rotateX(0deg) rotateY(90deg) rotateZ(0deg)';
    case 'top':
      return 'translate(-50%, -50%) rotateX(-90deg) rotateY(0deg) rotateZ(0deg)';
    case 'bottom':
      return 'translate(-50%, -50%) rotateX(90deg) rotateY(0deg) rotateZ(0deg)';
    default:
      return 'translate(-50%, -50%) rotateX(0deg) rotateY(0deg) rotateZ(0deg)';
  }
}

// Auto-alignment system - no manual presentation needed

function rotateCube(face) {
  if (!cubeContainer) return;
  
  console.log('Rotating cube to face:', face);
  
  currentFace = face;
  
  // Update active navigation button
  document.querySelectorAll('.cube-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.face === face);
  });
  
  // Calculate rotation based on face - centered rotation around page center
  let rotation = '';
  switch (face) {
    case 'front':
      rotation = 'translate(-50%, -50%) rotateX(0deg) rotateY(0deg) rotateZ(0deg)';
      console.log('Front face: Inicio section');
      break;
    case 'back':
      rotation = 'translate(-50%, -50%) rotateX(0deg) rotateY(180deg) rotateZ(0deg)';
      console.log('Back face: Nosotros section');
      break;
    case 'right':
      rotation = 'translate(-50%, -50%) rotateX(0deg) rotateY(-90deg) rotateZ(0deg)';
      console.log('Right face: Destinos section');
      break;
    case 'left':
      rotation = 'translate(-50%, -50%) rotateX(0deg) rotateY(90deg) rotateZ(0deg)';
      console.log('Left face: Juego section');
      break;
    case 'top':
      rotation = 'translate(-50%, -50%) rotateX(-90deg) rotateY(0deg) rotateZ(0deg)';
      console.log('Top face: Contacto section');
      break;
    case 'bottom':
      rotation = 'translate(-50%, -50%) rotateX(90deg) rotateY(0deg) rotateZ(0deg)';
      console.log('Bottom face: Info section');
      break;
  }
  
  console.log('Applying rotation:', rotation);
  
  // Auto-align the cube perfectly for this face
  autoAlignCubeForFace(face, rotation);
  
  // Store current face for alignment
  currentFace = face;
  
  // Play rotation sound effect
  playRotationSound();
}

function autoAlignCubeForFace(face, rotation) {
  if (!cubeContainer) return;
  
  // Mostrar indicador de alineación
  showAutoAlignIndicator();
  
  // Calcular el centro de la ventana
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const centerX = viewportWidth / 2;
  const centerY = viewportHeight / 2;
  
  // Aplicar rotación centrada en la página con el cubo perfectamente centrado
  const centeredTransform = `${rotation} translateX(0) translateY(0) translateZ(0) scale(1)`;
  
  cubeContainer.style.transform = centeredTransform;
  cubeContainer.style.transformOrigin = 'center center';
  cubeContainer.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
  
  // Ajustar la perspectiva dinámicamente
  const scene = document.querySelector('.cube-scene');
  if (scene) {
    const optimalPerspective = Math.max(viewportWidth, viewportHeight) * 1.5;
    scene.style.perspective = `${optimalPerspective}px`;
    scene.style.perspectiveOrigin = '50% 50%';
  }
  
  // Después de la rotación, asegurar que la cara esté perfectamente centrada
  setTimeout(() => {
    // Ajustar el contenido de la cara para que se vea el centro de la página
    const currentFaceElement = document.querySelector(`.cube-face.${face}`);
    if (currentFaceElement) {
      currentFaceElement.style.transform = 'translate(-50%, -50%)';
      currentFaceElement.style.left = '50%';
      currentFaceElement.style.top = '50%';
    }
    
    console.log(`✅ Cara ${face} auto-alineada perfectamente al centro de la página`);
    
    // Ocultar indicador después de completar
    hideAutoAlignIndicator();
    
    // Actualizar estado de alineación
    updateZoomStatus();
  }, 800);
}

function playRotationSound() {
  // Create a simple sound effect using Web Audio API
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    console.log('Audio context not available:', error);
  }
}

function initializeCubeNavigation() {
  // Add keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!isCubeMode) return;
    
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        toggleCubeMode();
        break;
      // Auto-alignment system - no manual zoom controls needed
      case 'r':
      case 'R':
        e.preventDefault();
        console.log('🔄 Auto-realigning cube...');
        autoAlignCube();
        setTimeout(() => rotateCube(currentFace), 300);
        break;
    }
  });
}

function initCubeCarousel() {
  const track = document.getElementById('carousel-track-cube');
  const viewport = document.getElementById('destinos-viewport-cube');
  if (!track || !viewport) return;
  
  const prev = document.querySelector('#cube-scene .carousel-btn.prev');
  const next = document.querySelector('#cube-scene .carousel-btn.next');
  
  let currentIndex = 0;
  let carouselTransitioning = false;
  let autoPlayInterval;
  
  // Get all original cards
  const originalCards = Array.from(track.querySelectorAll('.card'));
  const cardCount = originalCards.length;
  
  // Create multiple clones for smooth infinite effect
  const clonesBefore = [];
  const clonesAfter = [];
  
  // Clone cards multiple times before and after
  for (let i = 0; i < 3; i++) {
    originalCards.forEach(card => {
      const cloneBefore = card.cloneNode(true);
      const cloneAfter = card.cloneNode(true);
      clonesBefore.push(cloneBefore);
      clonesAfter.push(cloneAfter);
    });
  }
  
  // Add clones to track
  clonesBefore.reverse().forEach(clone => track.insertBefore(clone, track.firstChild));
  clonesAfter.forEach(clone => track.appendChild(clone));
  
  // Set initial position to show the first original card
  const cardWidth = 280 + 16; // card width + gap
  const initialOffset = clonesBefore.length * cardWidth;
  track.style.transform = `translateX(-${initialOffset}px)`;
  
  function updateCarousel(index, smooth = true) {
    if (carouselTransitioning) return;
    
    carouselTransitioning = true;
    track.style.transition = smooth ? 'transform 0.5s ease' : 'none';
    
    const offset = initialOffset + (index * cardWidth);
    track.style.transform = `translateX(-${offset}px)`;
    
    if (smooth) {
      setTimeout(() => {
        carouselTransitioning = false;
        
        // Reset to equivalent position in the middle set for infinite loop
        if (index >= cardCount * 2) {
          currentIndex = index - cardCount;
          track.style.transition = 'none';
          const newOffset = initialOffset + (currentIndex * cardWidth);
          track.style.transform = `translateX(-${newOffset}px)`;
        } else if (index < cardCount) {
          currentIndex = index + cardCount;
          track.style.transition = 'none';
          const newOffset = initialOffset + (currentIndex * cardWidth);
          track.style.transform = `translateX(-${newOffset}px)`;
        }
      }, 500);
    }
  }
  
  function nextSlide() {
    if (carouselTransitioning) return;
    currentIndex++;
    updateCarousel(currentIndex);
  }
  
  function prevSlide() {
    if (carouselTransitioning) return;
    currentIndex--;
    updateCarousel(currentIndex);
  }
  
  function startAutoPlay() {
    autoPlayInterval = setInterval(nextSlide, 3500);
  }
  
  function stopAutoPlay() {
    clearInterval(autoPlayInterval);
  }
  
  // Event listeners
  console.log('Adding event listeners to main carousel buttons');
  
  next && next.addEventListener('click', () => {
    console.log('Main carousel next button clicked');
    stopAutoPlay();
    nextSlide();
    startAutoPlay();
  });
  
  prev && prev.addEventListener('click', () => {
    console.log('Main carousel prev button clicked');
    stopAutoPlay();
    prevSlide();
    startAutoPlay();
  });
  
  // Pause on hover
  viewport.addEventListener('mouseenter', stopAutoPlay);
  viewport.addEventListener('mouseleave', startAutoPlay);
  
  // Start autoplay
  startAutoPlay();
}

function initCubeGame() {
  const boardEl = document.getElementById('board-cube');
  if (!boardEl || boardEl.dataset.init === '1') return;
  const cubeGame = new Game2048();
  cubeGame.board = boardEl;
  cubeGame.scoreEl = document.getElementById('score-cube');
  cubeGame.bestEl = document.getElementById('best-cube');
  cubeGame.msg = document.getElementById('game-message-cube');
  cubeGame.msgText = cubeGame.msg ? cubeGame.msg.querySelector('.message-text') : null;
  cubeGame.newBtn = document.getElementById('new-game-cube');
  cubeGame.contBtn = document.getElementById('continue-game-cube');
  cubeGame.restartBtn = document.getElementById('restart-game-cube');
  cubeGame.bind();
  cubeGame.newGame();
  boardEl.dataset.init = '1';
}

function initCubeContactForm() {
  const contactForm = document.getElementById('contact-form-cube');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviado';
      const msg = document.createElement('div');
      msg.className = 'form-success';
      msg.textContent = 'Gracias por tu mensaje, te contactaremos pronto.';
      contactForm.appendChild(msg);
      setTimeout(()=>{
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar';
        msg.remove();
        contactForm.reset();
      }, 1800);
    });
  }
  
  // Reset theme button for cube
  const resetThemeBtn = document.getElementById('reset-theme-cube');
  resetThemeBtn?.addEventListener('click', () => {
    localStorage.removeItem('site-theme');
    html.removeAttribute('data-theme');
    updateThemeUI();
  });
}

function initCubeTestimonials() {
  const wrap = document.getElementById('testi-carousel-cube');
  if (!wrap) return;
  
  const slides = Array.from(wrap.children);
  let idx = 0;
  
  function show(i) {
    slides.forEach((s, si) => s.style.transform = `translateX(${(si - i) * 100}%)`);
  }
  
  show(0);
  setInterval(() => {
    idx = (idx + 1) % slides.length;
    show(idx);
  }, 3500);
}

// Add cube carousel navigation function
function moveCarousel(direction) {
  // Find the presentation mode carousel and trigger navigation
  const prev = document.querySelector('#presentation-scene .carousel-btn.prev');
  const next = document.querySelector('#presentation-scene .carousel-btn.next');
  
  if (direction === 'prev' && prev) {
    prev.click();
  } else if (direction === 'next' && next) {
    next.click();
  }
}

// Add regular carousel navigation function
function moveCarouselRegular(direction) {
  // Find the regular carousel buttons and trigger their click events
  const prev = document.querySelector('.destinos-carousel .carousel-btn.prev');
  const next = document.querySelector('.destinos-carousel .carousel-btn.next');
  
  console.log('moveCarouselRegular called:', direction);
  console.log('prev button found:', !!prev);
  console.log('next button found:', !!next);
  
  if (direction === 'prev' && prev) {
    console.log('Clicking prev button');
    prev.click();
  } else if (direction === 'next' && next) {
    console.log('Clicking next button');
    next.click();
  } else {
    console.log('Button not found or invalid direction');
  }
}

// Initialize main carousel
function initMainCarousel() {
  console.log('🎯 initMainCarousel function called!');
  console.log('Initializing main carousel');
  const track = document.getElementById('carousel-track');
  const viewport = document.getElementById('destinos-viewport');
  console.log('Track element:', track);
  console.log('Viewport element:', viewport);
  if (!track || !viewport) {
    console.log('❌ Main carousel not found');
    return;
  }
  console.log('✅ Main carousel initialized');
  
  // Initialize the main carousel functionality
  const prev = document.querySelector('.destinos-carousel .carousel-btn.prev');
  const next = document.querySelector('.destinos-carousel .carousel-btn.next');
  
  console.log('Main carousel prev button:', prev);
  console.log('Main carousel next button:', next);
  
  let currentIndex = 0;
  let mainCarouselTransitioning = false;
  let autoPlayInterval;
  
  // Get all original cards
  const originalCards = Array.from(track.querySelectorAll('.card'));
  const cardCount = originalCards.length;
  
  if (cardCount === 0) {
    console.log('❌ No cards found in main carousel');
    return;
  }
  
  // Create multiple clones for smooth infinite effect
  const clonesBefore = [];
  const clonesAfter = [];
  
  // Clone cards multiple times before and after
  for (let i = 0; i < 3; i++) {
    originalCards.forEach(card => {
      const cloneBefore = card.cloneNode(true);
      const cloneAfter = card.cloneNode(true);
      clonesBefore.push(cloneBefore);
      clonesAfter.push(cloneAfter);
    });
  }
  
  // Add clones to track
  clonesBefore.reverse().forEach(clone => track.insertBefore(clone, track.firstChild));
  clonesAfter.forEach(clone => track.appendChild(clone));
  
  // Set initial position to show the first original card
  const cardWidth = 280 + 16; // card width + gap
  const initialOffset = clonesBefore.length * cardWidth;
  track.style.transform = `translateX(-${initialOffset}px)`;
  
  function updateCarousel(index, smooth = true) {
    if (mainCarouselTransitioning) return;
    
    mainCarouselTransitioning = true;
    track.style.transition = smooth ? 'transform 0.5s ease' : 'none';
    
    const offset = initialOffset + (index * cardWidth);
    track.style.transform = `translateX(-${offset}px)`;
    
    if (smooth) {
      setTimeout(() => {
        mainCarouselTransitioning = false;
        
        // Reset to equivalent position in the middle set for infinite loop
        if (index >= cardCount * 2) {
          currentIndex = index - cardCount;
          track.style.transition = 'none';
          const newOffset = initialOffset + (currentIndex * cardWidth);
          track.style.transform = `translateX(-${newOffset}px)`;
        } else if (index < cardCount) {
          currentIndex = index + cardCount;
          track.style.transition = 'none';
          const newOffset = initialOffset + (currentIndex * cardWidth);
          track.style.transform = `translateX(-${newOffset}px)`;
        }
      }, 500);
    }
  }
  
  function nextSlide() {
    if (mainCarouselTransitioning) return;
    currentIndex++;
    updateCarousel(currentIndex);
  }
  
  function prevSlide() {
    if (mainCarouselTransitioning) return;
    currentIndex--;
    updateCarousel(currentIndex);
  }
  
  function startAutoPlay() {
    autoPlayInterval = setInterval(nextSlide, 3500);
  }
  
  function stopAutoPlay() {
    clearInterval(autoPlayInterval);
  }
  
  // Event listeners
  if (next) {
    console.log('Adding next button listener');
    next.addEventListener('click', () => {
      console.log('Main carousel next button clicked');
      stopAutoPlay();
      nextSlide();
      startAutoPlay();
    });
  }
  
  if (prev) {
    console.log('Adding prev button listener');
    prev.addEventListener('click', () => {
      console.log('Main carousel prev button clicked');
      stopAutoPlay();
      prevSlide();
      startAutoPlay();
    });
  }
  
  // Pause on hover
  viewport.addEventListener('mouseenter', stopAutoPlay);
  viewport.addEventListener('mouseleave', startAutoPlay);
  
  // Start autoplay
  startAutoPlay();
  
  console.log('✅ Main carousel fully initialized and started');
}

// Call the function immediately
initMainCarousel();

/* ===========================
   Simple client-side page transition (fade)
   =========================== */
document.querySelectorAll('a[href$=".html"]').forEach(link=>{
  link.addEventListener('click', (e)=>{
    // allow middle-click / ctrl-click
    if (e.metaKey || e.ctrlKey || e.button === 1) return;
    e.preventDefault();
    const href = link.getAttribute('href');
    document.body.style.opacity = '0';
    setTimeout(()=> window.location.href = href, 300);
  });
});

/* ===========================
   MAPS EMBED (each internal page has data-map attribute)
   =========================== */
(function initMaps(){
  // For internal pages only: check for an element with id="map-target"
  const mapTarget = document.getElementById('map-target');
  if (!mapTarget) return;

  // mapping by page slug (simple)
  const mapData = {
    'cartagena.html': 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!...', // placeholder - will be replaced below
  };

  // We'll detect from a data attribute on the container (set in each internal page)
  const place = mapTarget.dataset.place || '';
  // Provide default embed URLs for the four destinations (static embed links)
  const embeds = {
    cartagena: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3977.858060349517!2d-75.59511008567933!3d10.391048992597017!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ef624d5a7a4fb0f%3A0x5a8c1f3b9b3f0d7e!2sCartagena%20de%20Indias!5e0!3m2!1ses-419!2sco!4v1690000000000",
    oaxaca: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3733.0000000000005!2d-96.726586!3d17.073184!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85c722a0b0a0a0a1%3A0x6a9b2d0b5e6b6b2a!2sOaxaca!5e0!3m2!1ses-419!2smx!4v1690000000001",
    napoles: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d52884.000000000004!2d14.170309!3d40.851775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x133bb0a0a0a0a0a1%3A0x1234567890abcdef!2sNaples!5e0!3m2!1sen!2sit!4v1690000000002",
    lima: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d48334.00000000001!2d-77.080!3d-12.046374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c8b0a0a0a0a1%3A0xabcdef1234567890!2sLima!5e0!3m2!1ses-419!2spe!4v1690000000003"
  };

  const key = place.toLowerCase();
  const src = embeds[key] || embeds.cartagena;
  const iframe = document.createElement('iframe');
  iframe.src = src;
  iframe.width = "100%";
  iframe.height = "350";
  iframe.style.border = '0';
  iframe.loading = 'lazy';
  mapTarget.appendChild(iframe);
})();

/* ===========================
   SIMPLE CAROUSEL FOR INTERNAL PAGES (if exists)
   =========================== */
(function internalCarousel(){
  const carousel = document.querySelector('.simple-carousel');
  if (!carousel) return;
  const slides = Array.from(carousel.querySelectorAll('.slide'));
  let i = 0;
  function show(n){
    slides.forEach((s,idx)=> s.style.transform = `translateX(${(idx - n) * 100}%)`);
  }
  show(0);
  setInterval(()=>{ i = (i+1) % slides.length; show(i); }, 3000);
})();

const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviado';
    const msg = document.createElement('div');
    msg.className = 'form-success';
    msg.textContent = 'Gracias por tu mensaje, te contactaremos pronto.';
    contactForm.appendChild(msg);
    setTimeout(()=>{
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar';
      msg.remove();
      contactForm.reset();
    }, 1800);
  });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.pageYOffset - 70;
    window.scrollTo({ top, behavior: 'smooth' });
    if (nav && nav.classList.contains('open')) {
      nav.classList.remove('open');
      menuToggle?.classList.remove('open');
      menuToggle?.setAttribute('aria-expanded', 'false');
    }
  });
});

class Game2048 {
  constructor() {
    this.size = 4;
    this.cells = Array(this.size * this.size).fill(0);
    this.score = 0;
    this.best = parseInt(localStorage.getItem('2048-best') || '0');
    this.board = document.getElementById('board');
    if (!this.board) return;
    this.scoreEl = document.getElementById('score');
    this.bestEl = document.getElementById('best');
    this.msg = document.getElementById('game-message');
    this.msgText = this.msg ? this.msg.querySelector('.message-text') : null;
    this.newBtn = document.getElementById('new-game');
    this.contBtn = document.getElementById('continue-game');
    this.restartBtn = document.getElementById('restart-game');
    this.won = false;
    this.over = false;
    this.animating = false;
    this.bind();
    this.newGame();
  }
  bind() {
    this.keyHandler = (e) => {
      // Solo responder a flechas si el juego está visible y activo
      const gameSection = document.querySelector('.presentation-slide.left');
      const normalGameSection = document.getElementById('juego');
      
      // Check if game is visible in either presentation mode or normal mode
      const isPresentationGameActive = gameSection && gameSection.classList.contains('active');
      const isNormalGameVisible = normalGameSection && normalGameSection.offsetParent !== null;
      
      if (!isPresentationGameActive && !isNormalGameVisible) return;
      
      const k = e.key;
      if (['ArrowLeft', 'a', 'A'].includes(k)) { e.preventDefault(); this.move('left'); }
      else if (['ArrowRight', 'd', 'D'].includes(k)) { e.preventDefault(); this.move('right'); }
      else if (['ArrowUp', 'w', 'W'].includes(k)) { e.preventDefault(); this.move('up'); }
      else if (['ArrowDown', 's', 'S'].includes(k)) { e.preventDefault(); this.move('down'); }
    };
    document.addEventListener('keydown', this.keyHandler);
    let sx = 0, sy = 0;
    this.board.addEventListener('touchstart', (e) => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; }, { passive: true });
    this.board.addEventListener('touchend', (e) => {
      const t = e.changedTouches[0]; const dx = t.clientX - sx; const dy = t.clientY - sy;
      const ax = Math.abs(dx), ay = Math.abs(dy); const th = 24;
      if (Math.max(ax, ay) < th) return;
      if (ax > ay) this.move(dx < 0 ? 'left' : 'right'); else this.move(dy < 0 ? 'up' : 'down');
    });
    this.newBtn && this.newBtn.addEventListener('click', () => this.newGame());
    this.restartBtn && this.restartBtn.addEventListener('click', () => this.newGame());
    this.contBtn && this.contBtn.addEventListener('click', () => this.hideMessage());
  }
  newGame() {
    this.cells.fill(0);
    this.score = 0;
    this.won = false;
    this.over = false;
    this.updateScore();
    this.hideMessage();
    this.addTile();
    this.addTile();
    this.render();
  }
  addTile() {
    const empty = [];
    for (let i = 0; i < this.cells.length; i++) if (this.cells[i] === 0) empty.push(i);
    if (empty.length === 0) return;
    const idx = empty[Math.floor(Math.random() * empty.length)];
    this.cells[idx] = Math.random() < 0.9 ? 2 : 4;
    return idx;
  }
  move(dir) {
    if (this.over || this.animating) return;
    const calc = this.calculate(dir);
    if (!calc) return;
    const { newCells, gained, moves, mergeDests, moved } = calc;
    if (!moved) return;
    this.animating = true;
    this.animateMoves(moves, () => {
      this.cells = newCells;
      this.score += gained;
      this.updateScore();
      const added = this.addTile();
      this.render();
      if (typeof added === 'number') {
        const tile = this.board.children[added];
        if (tile) { tile.classList.add('spawn'); setTimeout(()=> tile.classList.remove('spawn'), 200); }
      }
      mergeDests.forEach(idx => {
        const tile = this.board.children[idx];
        if (tile) { tile.classList.add('pop'); setTimeout(()=> tile.classList.remove('pop'), 180); }
      });
      if (!this.won && this.cells.some(v => v >= 2048)) { this.won = true; this.showMessage('win'); }
      if (!this.canMove()) { this.over = true; this.showMessage('over'); }
      this.animating = false;
    });
  }
  calculate(dir) {
    const size = this.size;
    const before = this.cells.slice();
    const newCells = Array(size * size).fill(0);
    let gained = 0;
    const moves = [];
    const mergeDests = [];
    const idx = (r,c) => r*size + c;
    const processLine = (indices) => {
      const items = [];
      for (let k = 0; k < 4; k++) { const a = indices[k]; const v = before[a]; if (v !== 0) items.push({ v, from: a }); }
      let pos = 0;
      let i = 0;
      while (i < items.length) {
        if (i + 1 < items.length && items[i].v === items[i+1].v) {
          const sum = items[i].v * 2; const dest = indices[pos]; newCells[dest] = sum; gained += sum; mergeDests.push(dest);
          moves.push({ from: items[i].from, to: dest, value: items[i].v });
          moves.push({ from: items[i+1].from, to: dest, value: items[i+1].v });
          pos++; i += 2;
        } else {
          const dest = indices[pos]; newCells[dest] = items[i].v;
          if (items[i].from !== dest) moves.push({ from: items[i].from, to: dest, value: items[i].v });
          pos++; i++;
        }
      }
    };
    if (dir === 'left') {
      for (let r = 0; r < size; r++) processLine([idx(r,0), idx(r,1), idx(r,2), idx(r,3)]);
    } else if (dir === 'right') {
      for (let r = 0; r < size; r++) processLine([idx(r,3), idx(r,2), idx(r,1), idx(r,0)]);
    } else if (dir === 'up') {
      for (let c = 0; c < size; c++) processLine([idx(0,c), idx(1,c), idx(2,c), idx(3,c)]);
    } else if (dir === 'down') {
      for (let c = 0; c < size; c++) processLine([idx(3,c), idx(2,c), idx(1,c), idx(0,c)]);
    }
    let moved = false;
    for (let i2 = 0; i2 < before.length; i2++) { if (before[i2] !== newCells[i2]) { moved = true; break; } }
    return { newCells, gained, moves, mergeDests, moved };
  }
  animateMoves(moves, done) {
    if (moves.length === 0) { done(); return; }
    const boardRect = this.board.getBoundingClientRect();
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    this.board.appendChild(overlay);
    const hideIdx = new Set();
    const els = [];
    for (let i = 0; i < moves.length; i++) {
      const { from, to, value } = moves[i];
      if (from === to) continue;
      const fromCell = this.board.children[from];
      const toCell = this.board.children[to];
      if (!fromCell || !toCell) continue;
      hideIdx.add(from);
      hideIdx.add(to);
      const fr = fromCell.getBoundingClientRect();
      const tr = toCell.getBoundingClientRect();
      const tile = document.createElement('div');
      tile.className = 'tile moving';
      const s = this.tileStyle(value);
      tile.textContent = String(value);
      tile.style.background = s.bg; tile.style.color = s.fg; tile.style.fontSize = s.fs;
      tile.style.width = fr.width + 'px'; tile.style.height = fr.height + 'px';
      tile.style.left = (fr.left - boardRect.left) + 'px';
      tile.style.top = (fr.top - boardRect.top) + 'px';
      tile.style.transition = 'transform 120ms ease-in-out';
      overlay.appendChild(tile);
      const dx = tr.left - fr.left; const dy = tr.top - fr.top;
      els.push({ el: tile, dx, dy });
    }
    hideIdx.forEach(idx => { const cell = this.board.children[idx]; if (cell) cell.style.visibility = 'hidden'; });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        els.forEach(t => { t.el.style.transform = `translate(${t.dx}px, ${t.dy}px)`; });
      });
    });
    setTimeout(() => { overlay.remove(); done(); }, 140);
  }
  canMove() {
    if (this.cells.some(v => v === 0)) return true;
    const s = this.size;
    for (let r = 0; r < s; r++) {
      for (let c = 0; c < s; c++) {
        const v = this.cells[r * s + c];
        if (c + 1 < s && v === this.cells[r * s + c + 1]) return true;
        if (r + 1 < s && v === this.cells[(r + 1) * s + c]) return true;
      }
    }
    return false;
  }
  render() {
    if (!this.board) return;
    this.board.innerHTML = '';
    for (let i = 0; i < this.cells.length; i++) {
      const val = this.cells[i];
      const d = document.createElement('div');
      d.className = 'tile' + (val === 0 ? ' empty' : '');
      if (val > 0) { d.textContent = String(val); const s = this.tileStyle(val); d.style.background = s.bg; d.style.color = s.fg; d.style.fontSize = s.fs; }
      this.board.appendChild(d);
    }
  }
  tileStyle(v) {
    const map = { 2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563', 32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72', 256: '#edcc61', 512: '#edc850', 1024: '#edc53f', 2048: '#edc22e' };
    const bg = map[v] || '#3c3a32';
    const fg = v <= 4 ? '#776e65' : '#fefefe';
    const fs = v >= 1024 ? '1.1rem' : v >= 128 ? '1.2rem' : v >= 16 ? '1.3rem' : '1.4rem';
    return { bg, fg, fs };
  }
  updateScore() {
    if (this.scoreEl) this.scoreEl.textContent = String(this.score);
    if (this.best < this.score) { this.best = this.score; localStorage.setItem('2048-best', String(this.best)); }
    if (this.bestEl) this.bestEl.textContent = String(this.best);
  }
  showMessage(type) {
    if (!this.msg || !this.msgText) return;
    const txt = type === 'win' ? '¡2048! Puedes continuar.' : 'Juego terminado';
    this.msg.classList.add('visible');
    this.msgText.textContent = txt;
    if (type === 'win') { this.contBtn && this.contBtn.classList.remove('hidden'); }
    else { this.contBtn && this.contBtn.classList.add('hidden'); }
  }
  hideMessage() {
    if (!this.msg) return;
    this.msg.classList.remove('visible');
  }
}

// Initialize 2048 game after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const boardEl = document.getElementById('board');
  if (boardEl) new Game2048();
});

function initBangkokMarket() {
  const marketBoats = document.querySelectorAll('.market-boat');
  const marketContainer = document.querySelector('.floating-market');
  const collectedContainer = document.getElementById('collected-ingredients');
  const messageDiv = document.getElementById('collection-message');
  const resetBtn = document.getElementById('market-reset');
  if ((!marketBoats.length && !marketContainer) || !collectedContainer || !messageDiv) return;
  let collectedIngredients = [];
  const ingredients = {
    'padthai': { name: 'Pad Thai', emoji: '🍜' },
    'tom-yum': { name: 'Tom Yum Goong', emoji: '🍲' },
    'mango': { name: 'Mango Sticky Rice', emoji: '🥭' },
    'curry': { name: 'Green Curry', emoji: '🍛' }
  };
  const activateBoat = (boat) => {
    const ingredient = boat && boat.dataset ? boat.dataset.ingredient : null;
    if (!ingredient || collectedIngredients.includes(ingredient)) return;
    collectedIngredients.push(ingredient);
    boat.style.opacity = '0.5';
    boat.style.pointerEvents = 'none';
    const item = document.createElement('div');
    item.className = 'collected-item';
    item.innerHTML = `${ingredients[ingredient].emoji} ${ingredients[ingredient].name}`;
    collectedContainer.appendChild(item);
    if (collectedIngredients.length === Object.keys(ingredients).length) {
      messageDiv.innerHTML = '🎉 ¡Has descubierto todos los sabores tailandeses!';
      messageDiv.style.color = '#ff7b00';
    } else {
      messageDiv.textContent = `¡Excelente! Has encontrado ${ingredients[ingredient].name}`;
    }
  };

  marketBoats.forEach(boat => {
    boat.setAttribute('tabindex', '0');
    boat.setAttribute('role', 'button');
    boat.addEventListener('click', () => activateBoat(boat));
    boat.addEventListener('pointerdown', () => activateBoat(boat));
    boat.addEventListener('touchstart', (e) => { e.preventDefault(); activateBoat(boat); }, { passive: false });
    boat.addEventListener('keydown', function(e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activateBoat(boat); } });
  });

  if (marketContainer) {
    marketContainer.addEventListener('click', (e) => {
      const boat = e.target.closest('.market-boat');
      if (boat) activateBoat(boat);
    });
    marketContainer.addEventListener('pointerdown', (e) => {
      const boat = e.target.closest('.market-boat');
      if (boat) activateBoat(boat);
    });
    marketContainer.addEventListener('touchstart', (e) => {
      const boat = e.target.closest('.market-boat');
      if (boat) { e.preventDefault(); activateBoat(boat); }
    }, { passive: false });
    marketContainer.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const boat = e.target.closest('.market-boat');
      if (boat) { e.preventDefault(); activateBoat(boat); }
    });
  }
  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      collectedIngredients = [];
      messageDiv.textContent = '';
      messageDiv.style.color = '';
      collectedContainer.innerHTML = '';
      marketBoats.forEach(function(boat){
        boat.style.opacity = '1';
        boat.style.pointerEvents = 'auto';
      });
    });
  }
}
window.initBangkokMarket = initBangkokMarket;
if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initBangkokMarket); } else { initBangkokMarket(); }

/* ===========================
   BARCELONA TAPAS GAME
   =========================== */
(function initBarcelonaTapas() {
  const tapasItems = document.querySelectorAll('.tapas-item');
  const drinkItems = document.querySelectorAll('.drink-item');
  const scoreSpan = document.getElementById('tapas-score');
  const attemptsSpan = document.getElementById('tapas-attempts');
  const messageDiv = document.getElementById('tapas-message');
  const resetBtn = document.getElementById('reset-tapas-game');
  
  if (!tapasItems.length) return;
  
  let score = 0;
  let attempts = 6;
  let selectedTapa = null;
  let selectedDrink = null;
  
  const combinations = {
    'paella': 'sangria',
    'jamon': 'vino',
    'patatas': 'cerveza'
  };
  
  function updateUI() {
    scoreSpan.textContent = score;
    attemptsSpan.textContent = attempts;
    
    if (attempts === 0 || score === 3) {
      if (score === 3) {
        messageDiv.innerHTML = '🎉 ¡Eres un experto en tapas españolas!';
      } else {
        messageDiv.innerHTML = `🎯 ¡Buen intento! Obtuviste ${score}/3 combinaciones correctas.`;
      }
      resetBtn.style.display = 'inline-block';
      tapasItems.forEach(item => item.style.pointerEvents = 'none');
      drinkItems.forEach(item => item.style.pointerEvents = 'none');
    }
  }
  
  tapasItems.forEach(item => {
    item.addEventListener('click', function() {
      tapasItems.forEach(i => i.classList.remove('selected'));
      this.classList.add('selected');
      selectedTapa = this.dataset.tapa;
      
      if (selectedDrink) {
        checkCombination();
      }
    });
  });
  
  drinkItems.forEach(item => {
    item.addEventListener('click', function() {
      drinkItems.forEach(i => i.classList.remove('selected'));
      this.classList.add('selected');
      selectedDrink = this.dataset.drink;
      
      if (selectedTapa) {
        checkCombination();
      }
    });
  });
  
  function checkCombination() {
    if (combinations[selectedTapa] === selectedDrink) {
      score++;
      messageDiv.innerHTML = `✅ ¡Combinación perfecta! ${selectedTapa} + ${selectedDrink}`;
      document.querySelector(`[data-tapa="${selectedTapa}"]`).style.opacity = '0.5';
      document.querySelector(`[data-drink="${selectedDrink}"]`).style.opacity = '0.5';
    } else {
      messageDiv.innerHTML = `❌ Casi! Intenta otra combinación.`;
    }
    
    attempts--;
    selectedTapa = null;
    selectedDrink = null;
    tapasItems.forEach(item => item.classList.remove('selected'));
    drinkItems.forEach(item => item.classList.remove('selected'));
    updateUI();
  }
  
  resetBtn.addEventListener('click', function() {
    score = 0;
    attempts = 6;
    selectedTapa = null;
    selectedDrink = null;
    messageDiv.innerHTML = '';
    resetBtn.style.display = 'none';
    
    tapasItems.forEach(item => {
      item.classList.remove('selected');
      item.style.opacity = '1';
      item.style.pointerEvents = 'auto';
    });
    
    drinkItems.forEach(item => {
      item.classList.remove('selected');
      item.style.opacity = '1';
      item.style.pointerEvents = 'auto';
    });
    
    updateUI();
  });
  
  updateUI();
})();

/* ===========================
   ISTANBUL SPICE QUIZ
   =========================== */
(function initIstanbulQuiz() {
  const quizData = [
    {
      spice: 'canela',
      name: 'Canela',
      emoji: '🌿',
      clue: 'Dulce y aromática, perfecta para postres',
      options: ['Canela', 'Comino', 'Cúrcuma', 'Pimentón']
    },
    {
      spice: 'comino',
      name: 'Comino',
      emoji: '🟤',
      clue: 'Semilla con sabor terroso y ligeramente amargo',
      options: ['Comino', 'Cilantro', 'Anís', 'Hinojo']
    },
    {
      spice: 'curcuma',
      name: 'Cúrcuma',
      emoji: '🟡',
      clue: 'Polvo dorado con propiedades antiinflamatorias',
      options: ['Cúrcuma', 'Azafrán', 'Mostaza', 'Curry']
    },
    {
      spice: 'pimenton',
      name: 'Pimentón',
      emoji: '🔴',
      clue: 'Dulce o picante, hecho de pimientos secos',
      options: ['Pimentón', 'Cayena', 'Paprika', 'Chile']
    },
    {
      spice: 'azafran',
      name: 'Azafrán',
      emoji: '🟠',
      clue: 'La especia más cara del mundo, de color dorado',
      options: ['Azafrán', 'Cúrcuma', 'Canela', 'Vainilla']
    }
  ];
  
  const currentSpiceDiv = document.getElementById('current-spice');
  const spiceClueDiv = document.getElementById('spice-clue');
  const optionsDiv = document.getElementById('quiz-options');
  const feedbackDiv = document.getElementById('quiz-feedback');
  const nextBtn = document.getElementById('next-question');
  const resultsDiv = document.getElementById('quiz-results');
  const finalScoreDiv = document.getElementById('final-score');
  const restartBtn = document.getElementById('restart-quiz');
  const currentQuestionSpan = document.getElementById('current-question');
  const totalQuestionsSpan = document.getElementById('total-questions');
  const scoreSpan = document.getElementById('quiz-score');
  
  if (!currentSpiceDiv) return;
  
  let currentQuestion = 0;
  let score = 0;
  let answered = false;
  
  function loadQuestion() {
    const question = quizData[currentQuestion];
    answered = false;
    
    currentSpiceDiv.innerHTML = question.emoji;
    spiceClueDiv.textContent = question.clue;
    currentQuestionSpan.textContent = currentQuestion + 1;
    totalQuestionsSpan.textContent = quizData.length;
    
    optionsDiv.innerHTML = '';
    question.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.className = 'quiz-option';
      button.textContent = option;
      button.addEventListener('click', () => selectAnswer(option, question.name));
      optionsDiv.appendChild(button);
    });
    
    feedbackDiv.innerHTML = '';
    nextBtn.style.display = 'none';
  }
  
  function selectAnswer(selected, correct) {
    if (answered) return;
    answered = true;
    
    const buttons = optionsDiv.querySelectorAll('.quiz-option');
    buttons.forEach(button => {
      button.style.pointerEvents = 'none';
      if (button.textContent === correct) {
        button.classList.add('correct');
      } else if (button.textContent === selected && selected !== correct) {
        button.classList.add('incorrect');
      }
    });
    
    if (selected === correct) {
      score++;
      scoreSpan.textContent = score;
      feedbackDiv.innerHTML = `✅ ¡Correcto! Es ${correct}.`;
    } else {
      feedbackDiv.innerHTML = `❌ Incorrecto. La respuesta correcta es ${correct}.`;
    }
    
    nextBtn.style.display = 'inline-block';
  }
  
  nextBtn.addEventListener('click', function() {
    currentQuestion++;
    if (currentQuestion < quizData.length) {
      loadQuestion();
    } else {
      showResults();
    }
  });
  
  function showResults() {
    document.querySelector('.quiz-content').style.display = 'none';
    resultsDiv.style.display = 'block';
    
    const percentage = Math.round((score / quizData.length) * 100);
    let message = '';
    
    if (percentage === 100) {
      message = '🎉 ¡Eres un maestro de las especias! ¡Puntuación perfecta!';
    } else if (percentage >= 80) {
      message = '👏 ¡Excelente! Conoces muy bien las especias.';
    } else if (percentage >= 60) {
      message = '👍 ¡Bien! Tienes buen conocimiento de especias.';
    } else {
      message = '📚 ¡Sigue aprendiendo! Las especias tienen muchos secretos.';
    }
    
    finalScoreDiv.innerHTML = `${message}<br>Obtuviste ${score}/${quizData.length} (${percentage}%)`;
  }
  
  restartBtn.addEventListener('click', function() {
    currentQuestion = 0;
    score = 0;
    scoreSpan.textContent = 0;
    document.querySelector('.quiz-content').style.display = 'block';
    resultsDiv.style.display = 'none';
    loadQuestion();
  });
  
  loadQuestion();
})();

/* ===========================
   TOKYO SUSHI SIMULATOR
   =========================== */
(function initTokyoSushi() {
  const ingredients = document.querySelectorAll('.ingredient');
  const matCells = document.querySelectorAll('.mat-cell');
  const prepareBtn = document.getElementById('prepare-sushi');
  const clearBtn = document.getElementById('clear-mat');
  const rollBtn = document.getElementById('roll-sushi');
  const feedbackDiv = document.getElementById('sushi-feedback');
  const resultDiv = document.querySelector('.sushi-result .result-display');
  const resultNameDiv = document.querySelector('.sushi-result .result-name');
  
  if (!ingredients.length) return;
  
  let selectedIngredients = [];
  let currentStep = 0;
  
  const recipes = {
    'nigiri': { ingredients: ['arroz', 'salmon'], emoji: '🍣', name: 'Nigiri de Salmón' },
    'maki': { ingredients: ['alga', 'arroz', 'salmon', 'aguacate'], emoji: '🍱', name: 'Maki California' },
    'sashimi': { ingredients: ['salmon'], emoji: '🍣', name: 'Sashimi de Salmón' }
  };
  
  ingredients.forEach(ingredient => {
    ingredient.addEventListener('click', function() {
      const ingredientType = this.dataset.ingredient;
      if (selectedIngredients.length < 4) {
        selectedIngredients.push(ingredientType);
        updateMat();
        this.style.opacity = '0.5';
        this.style.pointerEvents = 'none';
        
        if (selectedIngredients.length >= 2) {
          prepareBtn.style.display = 'inline-block';
        }
      }
    });
  });
  
  function updateMat() {
    matCells.forEach((cell, index) => {
      if (selectedIngredients[index]) {
        const emojis = {
          'arroz': '🍚',
          'salmon': '🐟',
          'atun': '🐟',
          'alga': '🌿',
          'aguacate': '🥑',
          'wasabi': '💚'
        };
        cell.innerHTML = emojis[selectedIngredients[index]];
        cell.classList.add('filled');
      } else {
        cell.innerHTML = '';
        cell.classList.remove('filled');
      }
    });
  }
  
  prepareBtn.addEventListener('click', function() {
    identifySushi();
  });
  
  clearBtn.addEventListener('click', function() {
    selectedIngredients = [];
    updateMat();
    prepareBtn.style.display = 'none';
    rollBtn.style.display = 'none';
    feedbackDiv.innerHTML = '';
    resultDiv.innerHTML = '';
    resultNameDiv.innerHTML = '';
    
    ingredients.forEach(ingredient => {
      ingredient.style.opacity = '1';
      ingredient.style.pointerEvents = 'auto';
    });
  });
  
  function identifySushi() {
    let identified = false;
    
    for (const [recipeName, recipe] of Object.entries(recipes)) {
      if (arraysEqual(selectedIngredients.sort(), recipe.ingredients.sort())) {
        resultDiv.innerHTML = recipe.emoji;
        resultNameDiv.innerHTML = recipe.name;
        feedbackDiv.innerHTML = `✅ ¡Excelente! Has preparado ${recipe.name}.`;
        identified = true;
        
        if (recipeName === 'maki') {
          rollBtn.style.display = 'inline-block';
        }
        break;
      }
    }
    
    if (!identified) {
      resultDiv.innerHTML = '❓';
      resultNameDiv.innerHTML = 'Combinación desconocida';
      feedbackDiv.innerHTML = '🔍 ¡Interesante combinación! Experimenta con ingredientes tradicionales.';
    }
  }
  
  rollBtn.addEventListener('click', function() {
    feedbackDiv.innerHTML += '<br>🔄 ¡Perfecto enrollado! Tu maki está listo para servir.';
    this.style.display = 'none';
  });
  
  function arraysEqual(a, b) {
    return a.length === b.length && a.every((val, i) => val === b[i]);
  }
})();

/* ===========================
   MARRAKECH TAGINE TIMER
   =========================== */
(function initMarrakechTimer() {
  const recipeCards = document.querySelectorAll('.recipe-card');
  const timerDisplay = document.getElementById('timer-display');
  const timerTime = document.getElementById('timer-time');
  const timerLabel = document.getElementById('timer-label');
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');
  const startBtn = document.getElementById('start-timer');
  const pauseBtn = document.getElementById('pause-timer');
  const resetBtn = document.getElementById('reset-timer');
  const stepsList = document.getElementById('steps-list');
  const completionDiv = document.getElementById('timer-completion');
  const shareBtn = document.getElementById('share-recipe');
  
  if (!recipeCards.length) return;
  
  let selectedRecipe = null;
  let currentStep = 0;
  let timeRemaining = 0;
  let totalTime = 0;
  let timerInterval = null;
  let isPaused = false;
  
  const recipes = {
    'pollo-cilantro': {
      name: 'Tagine de Pollo con Cilantro',
      totalTime: 45,
      steps: [
        'Saltear la cebolla y el pollo (10 min)',
        'Agregar especias y agua (5 min)',
        'Cocinar a fuego lento (20 min)',
        'Agregar cilantro y limón (5 min)',
        'Reposar y servir (5 min)'
      ]
    },
    'cordero-albaricoques': {
      name: 'Tagine de Cordero con Albaricoques',
      totalTime: 90,
      steps: [
        'Marinar el cordero (15 min)',
        'Saltear cebollas y especias (10 min)',
        'Agregar cordero y cocinar (30 min)',
        'Incorporar albaricoques (20 min)',
        'Finalizar y reposar (15 min)'
      ]
    },
    'verduras-especias': {
      name: 'Tagine de Verduras y Especias',
      totalTime: 30,
      steps: [
        'Preparar verduras (5 min)',
        'Saltear especias (5 min)',
        'Agregar verduras y agua (5 min)',
        'Cocinar al vapor (10 min)',
        'Decorar y servir (5 min)'
      ]
    }
  };
  
  recipeCards.forEach(card => {
    card.addEventListener('click', function() {
      recipeCards.forEach(c => c.classList.remove('selected'));
      this.classList.add('selected');
      selectedRecipe = this.dataset.recipe;
      
      const recipe = recipes[selectedRecipe];
      totalTime = recipe.totalTime * 60; // Convert to seconds
      timeRemaining = totalTime;
      currentStep = 0;
      
      timerDisplay.style.display = 'block';
      document.getElementById('timer-steps').style.display = 'block';
      completionDiv.style.display = 'none';
      
      updateTimer();
      updateSteps();
      
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      
      startBtn.style.display = 'inline-block';
      pauseBtn.style.display = 'none';
      isPaused = false;
    });
  });
  
  startBtn.addEventListener('click', function() {
    if (!selectedRecipe) return;
    
    startBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-block';
    isPaused = false;
    
    timerInterval = setInterval(function() {
      if (!isPaused && timeRemaining > 0) {
        timeRemaining--;
        updateTimer();
        
        const progress = ((totalTime - timeRemaining) / totalTime) * 100;
        progressFill.style.width = progress + '%';
        
        const stepProgress = (totalTime - timeRemaining) / (totalTime / recipes[selectedRecipe].steps.length);
        const currentStepIndex = Math.floor(stepProgress);
        
        if (currentStepIndex > currentStep) {
          currentStep = currentStepIndex;
          updateSteps();
        }
        
        if (timeRemaining === 0) {
          completeTimer();
        }
      }
    }, 1000);
  });
  
  pauseBtn.addEventListener('click', function() {
    isPaused = !isPaused;
    this.textContent = isPaused ? '▶️ Reanudar' : '⏸️ Pausar';
  });
  
  resetBtn.addEventListener('click', function() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    
    if (selectedRecipe) {
      const recipe = recipes[selectedRecipe];
      timeRemaining = recipe.totalTime * 60;
      currentStep = 0;
      updateTimer();
      updateSteps();
      progressFill.style.width = '0%';
    }
    
    startBtn.style.display = 'inline-block';
    pauseBtn.style.display = 'none';
    completionDiv.style.display = 'none';
    isPaused = false;
  });
  
  function updateTimer() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timerTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (selectedRecipe) {
      const recipe = recipes[selectedRecipe];
      const stepIndex = Math.floor((totalTime - timeRemaining) / (totalTime / recipe.steps.length));
      const currentStepName = stepIndex < recipe.steps.length ? recipe.steps[stepIndex] : 'Finalizando...';
      timerLabel.textContent = currentStepName;
    }
  }
  
  function updateSteps() {
    if (!selectedRecipe) return;
    
    const recipe = recipes[selectedRecipe];
    stepsList.innerHTML = '';
    
    recipe.steps.forEach((step, index) => {
      const stepDiv = document.createElement('div');
      stepDiv.className = 'step-item';
      if (index < currentStep) {
        stepDiv.classList.add('completed');
      } else if (index === currentStep) {
        stepDiv.classList.add('current');
      }
      stepDiv.innerHTML = `<span class="step-number">${index + 1}</span> ${step}`;
      stepsList.appendChild(stepDiv);
    });
    
    progressText.textContent = `Paso ${Math.min(currentStep + 1, recipe.steps.length)} de ${recipe.steps.length}`;
  }
  
  function completeTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    
    completionDiv.style.display = 'block';
    timerDisplay.style.display = 'none';
    document.getElementById('timer-steps').style.display = 'none';
  }
  
  shareBtn.addEventListener('click', function() {
    if (selectedRecipe && recipes[selectedRecipe]) {
      const recipe = recipes[selectedRecipe];
      const shareText = `¡Acabo de preparar un delicioso ${recipe.name} usando el timer interactivo de Sabores y Destinos! 🍲`;
      
      if (navigator.share) {
        navigator.share({
          title: 'Receta de Tagine Marroquí',
          text: shareText,
          url: window.location.href
        });
      } else {
        navigator.clipboard.writeText(shareText);
        alert('¡Texto copiado al portapapeles!');
      }
    }
  });
})();

/* ===========================
   MAP EMBEDS FOR NEW DESTINATIONS
   =========================== */
(function updateMaps() {
  const mapTarget = document.getElementById('map-target');
  if (!mapTarget) return;
  
  const place = mapTarget.dataset.place;
  const embeds = {
    bangkok: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387190.2799160891!2d100.45723077910156!3d13.72489365!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311d6032280d36f3%3A0xb5b1d7c796556a3d!2sBangkok%2C%20Thailand!5e0!3m2!1sen!2sus!4v1690000000004",
    barcelona: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d47889.36133789012!2d2.1094108791015625!3d41.385063949999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a49816718e30e5%3A0x44b0fb3f80052ab0!2sBarcelona%2C%20Spain!5e0!3m2!1sen!2sus!4v1690000000005",
    istanbul: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d48183.99999999999!2d28.949659679101562!3d41.0082376!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab989d9f8cb9b%3A0xd1f505d5b3a7e2d5!2sIstanbul%2C%20Turkey!5e0!3m2!1sen!2sus!4v1690000000006",
    tokio: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d103949.25819801165!2d139.60078477910155!3d35.6761919!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188b857628a2a1%3A0x8a5e9b9a3a3a3a3a!2sTokyo%2C%20Japan!5e0!3m2!1sen!2sus!4v1690000000007",
    marrakech: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d54431.99999999999!2d-7.999999999999999!3d31.629472!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xdafef0a8ac0a9f%3A0xa3a3a3a3a3a3a3a3!2sMarrakesh%2C%20Morocco!5e0!3m2!1sen!2sus!4v1690000000008"
  };
  
  const key = place.toLowerCase();
  const src = embeds[key];
  if (src) {
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.width = "100%";
    iframe.height = "350";
    iframe.style.border = '0';
    iframe.loading = 'lazy';
    mapTarget.appendChild(iframe);
  }
})();
function initSushiSimulator() {
  const simulator = document.querySelector('.sushi-simulator');
  if (!simulator) return;
  const ingredients = document.querySelectorAll('.ingredient');
  const cells = document.querySelectorAll('.mat-cell');
  const prepareBtn = document.getElementById('prepare-sushi');
  const clearBtn = document.getElementById('clear-mat');
  const rollBtn = document.getElementById('roll-sushi');
  const result = document.getElementById('sushi-result');
  const display = result ? result.querySelector('.result-display') : null;
  const nameEl = result ? result.querySelector('.result-name') : null;
  const feedback = document.getElementById('sushi-feedback');
  const emojiMap = { arroz: '🍚', salmon: '🐟', atun: '🐟', alga: '🌿', aguacate: '🥑', wasabi: '💚' };

  const placeIngredient = (ing) => {
    for (const cell of cells) {
      if (!cell.dataset.ingredient) {
        cell.dataset.ingredient = ing;
        cell.textContent = emojiMap[ing] || '❓';
        cell.classList.add('filled');
        return true;
      }
    }
    if (feedback) feedback.textContent = 'La esterilla está llena';
    return false;
  };

  const getList = () => Array.from(cells).map(c => c.dataset.ingredient).filter(Boolean);

  const evaluate = () => {
    const list = getList();
    const has = (x) => list.includes(x);
    const fish = has('salmon') || has('atun');
    if (list.length === 1 && fish && !has('arroz') && !has('alga')) {
      if (display) display.textContent = '🍣';
      if (nameEl) nameEl.textContent = 'Sashimi';
      if (feedback) feedback.textContent = 'Corte limpio y sabor puro.';
      if (rollBtn) rollBtn.style.display = 'none';
      return;
    }
    if (list.length === 2 && has('arroz') && fish) {
      if (display) display.textContent = '🍣';
      if (nameEl) nameEl.textContent = 'Nigiri';
      if (feedback) feedback.textContent = 'Equilibrio arroz-pescado.';
      if (rollBtn) rollBtn.style.display = 'none';
      return;
    }
    if (has('alga') && has('arroz') && fish) {
      if (display) display.textContent = '🍣';
      if (nameEl) nameEl.textContent = 'Maki';
      if (feedback) feedback.textContent = '¡Listo para enrollar!';
      if (rollBtn) rollBtn.style.display = 'inline-block';
      return;
    }
    if (display) display.textContent = '';
    if (nameEl) nameEl.textContent = '';
    if (feedback) feedback.textContent = 'Combinación no válida. Revisa las recetas.';
    if (rollBtn) rollBtn.style.display = 'none';
  };

  ingredients.forEach(el => {
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    const add = () => placeIngredient(el.dataset.ingredient);
    el.addEventListener('click', add);
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); add(); } });
  });

  if (prepareBtn) prepareBtn.addEventListener('click', evaluate);
  if (rollBtn) rollBtn.addEventListener('click', () => { if (nameEl && nameEl.textContent === 'Maki') { if (feedback) feedback.textContent = '🔄 ¡Tu Maki está enrollado!'; } });
  if (clearBtn) clearBtn.addEventListener('click', () => {
    cells.forEach(c => { c.textContent = ''; c.classList.remove('filled'); delete c.dataset.ingredient; });
    if (display) display.textContent = '';
    if (nameEl) nameEl.textContent = '';
    if (feedback) feedback.textContent = '';
    if (rollBtn) rollBtn.style.display = 'none';
  });
}

if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', initSushiSimulator); } else { initSushiSimulator(); }
