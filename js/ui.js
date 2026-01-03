// js/ui.js

// DOM Elements
const cycleList = document.getElementById("cycle-list");
const selectCycleSection = document.getElementById("selector-container");
// Timer section
const timerSection = document.getElementById("clock");
const phaseText = document.getElementById("phase");
const timeText = document.getElementById("time");
const progressText = document.getElementById("progress");
// Pause button
var pauseBtn = document.getElementById("pause-btn");
const soundBtn = document.getElementById("sound-btn");
// Phase image element
const phaseImage = document.getElementById("phase-image");
// Audio elements
var startSound = new Audio("assets/start.mp3");
var phaseSound = new Audio("assets/phase.mp3");
var endSound = new Audio("assets/end.mp3");
var backgroundMusic = new Audio("assets/music.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3;
var soundEnabled = true;

// UI setup when DOM is ready
const playBtn = document.getElementById("play-btn");

document.addEventListener("DOMContentLoaded", () => {
  try {
    console.debug("ui.js: DOMContentLoaded — initializing UI");

    if (!window.pomodoroCycles) console.warn("ui.js: pomodoroCycles is not defined");
    if (!cycleList) console.error("ui.js: #cycle-list element not found");

    (pomodoroCycles || []).forEach(cycle => {
      const button = document.createElement("button");
      button.textContent = cycle.name;
      // Apply Bootstrap classes to cycle buttons
      button.className = "btn btn-outline-success";

      button.addEventListener("click", (e) => {
        console.debug(`ui.js: cycle button clicked: ${cycle.name}`);
        try {
          // Prepare the selected cycle
          timerSection.classList.remove("hidden");
          if (typeof preparePomodoro === "function") {
            preparePomodoro(cycle);
          } else if (typeof startPomodoro === "function") {
            // fallback to original behavior
            startPomodoro(cycle);
          }
          if (playBtn) playBtn.disabled = false;
          // ensure pause is disabled until started
          if (typeof setPauseButtonDisabled === "function") setPauseButtonDisabled(true);
        } catch (err) {
          console.error("ui.js: error in cycle click handler", err);
        }
      });

      cycleList.appendChild(button);
    });

    // Stats modal opener — extract into a function so we can reuse for
    // an existing #stats-btn in markup or the created button.
    function openStatsModal() {
      try {
        const raw = localStorage.getItem('pomodoroStats');
        const s = raw ? JSON.parse(raw) : { totalFocusSeconds:0, breaksTaken:0, sessionsCompleted:0, sessionsAbandoned:0 };

        const fmt = (secs) => {
          const h = Math.floor(secs / 3600);
          const m = Math.floor((secs % 3600) / 60);
          return `${h}h ${m}m`;
        };

        const focusEl = document.getElementById('stat-focus');
        const breaksEl = document.getElementById('stat-breaks');
        const sessionsEl = document.getElementById('stat-sessions');
        if (focusEl) focusEl.textContent = `Total focus times: ${fmt(s.totalFocusSeconds || 0)}`;
        if (breaksEl) breaksEl.textContent = `Total breaks taken: ${s.breaksTaken || 0}`;
        if (sessionsEl) sessionsEl.textContent = `Sessions completed vs abandoned: ${s.sessionsCompleted || 0} vs ${s.sessionsAbandoned || 0}`;

        const canvas = document.getElementById('statsCanvas');
        if (canvas && canvas.getContext) {
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0,0,canvas.width, canvas.height);
          const completed = s.sessionsCompleted || 0;
          const abandoned = s.sessionsAbandoned || 0;
          const total = completed + abandoned;
          const cx = canvas.width / 2;
          const cy = canvas.height / 2;
          const radius = Math.min(cx, cy) - 10;

          if (total === 0) {
            ctx.fillStyle = '#e9ecef';
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();
          } else {
            let start = -Math.PI / 2;
            const compAngle = (completed / total) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.fillStyle = '#2e7d32';
            ctx.arc(cx, cy, radius, start, start + compAngle);
            ctx.closePath();
            ctx.fill();
            start += compAngle;
            const abAngle = (abandoned / total) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.fillStyle = '#c62828';
            ctx.arc(cx, cy, radius, start, start + abAngle);
            ctx.closePath();
            ctx.fill();
          }
        }

        const modalEl = document.getElementById('statsModal');
        if (modalEl && typeof bootstrap !== 'undefined') {
          const modal = new bootstrap.Modal(modalEl);
          modal.show();
        }
      } catch (err) {
        console.error('Failed to open stats modal', err);
      }
    }

    // Create the button element (used if there isn't already a #stats-btn in markup)
    const statsButton = document.createElement('button');
    statsButton.className = 'btn btn-stats mt-2';
    statsButton.setAttribute('aria-label', 'Stats');
    statsButton.setAttribute('title', 'Stats');
    statsButton.innerHTML = '<i class="bi bi-pie-chart-fill"></i>';
    statsButton.addEventListener('click', openStatsModal);

    // Prefer an existing #stats-btn in the DOM; otherwise use the created one.
    const controlsEl = document.querySelector('.controls');
    const existing = document.getElementById('stats-btn');
    const finalStatsBtn = existing || statsButton;
    if (!existing) finalStatsBtn.id = 'stats-btn';
    // normalize classes
    finalStatsBtn.className = 'btn btn-stats';
    // attach handler if this is an element that didn't have one
    if (existing && !existing._hasStatsHandler) {
      finalStatsBtn.addEventListener('click', openStatsModal);
      existing._hasStatsHandler = true;
    }

    if (controlsEl) {
      const volumeBtn = document.getElementById('sound-btn');
      if (volumeBtn && volumeBtn.parentNode === controlsEl) {
        controlsEl.insertBefore(finalStatsBtn, volumeBtn);
      } else {
        controlsEl.appendChild(finalStatsBtn);
      }
    } else {
      const selector = document.getElementById('selector-container');
      if (selector) selector.appendChild(finalStatsBtn);
    }
  } catch (err) {
    console.error("ui.js: initialization error", err);
  }
});

// Play button handler — start the prepared cycle
if (playBtn) {
  playBtn.addEventListener('click', () => {
    try {
      if (soundEnabled) startSound.play().catch(err => console.warn('startSound.play failed', err));
      if (soundEnabled) backgroundMusic.play().catch(err => console.warn('backgroundMusic.play failed', err));

      if (typeof startPomodoro === 'function') startPomodoro();

      // disable play while running
      playBtn.disabled = true;
      if (typeof setPauseButtonDisabled === 'function') setPauseButtonDisabled(false);
    } catch (err) {
      console.error('playBtn click error', err);
    }
  });
}

// UI functions
// track last displayed phase so we only show/hide facts on transitions
window._lastPhase = window._lastPhase || "ready";

function updateUI(phase, minutes, seconds, repetition, total) {
  if (phase === "work") {
    phaseText.innerHTML = "Study";
    phaseText.classList.remove("text-muted", "text-info");
    phaseText.classList.add("text-success");
    phaseText.classList.add("text-muted");

    phaseImage.src = "assets/work.svg";

  } else if (phase === "break") {
    phaseText.innerHTML = "Break";
    phaseText.classList.remove("text-success", "text-muted");
    phaseText.classList.add("text-danger");

    phaseImage.src = "assets/break.svg";

  } else {
    phaseText.innerHTML = "Ready";
    phaseText.classList.remove("text-success", "text-info");
    phaseText.classList.add("text-muted");

    // show the ready illustration when idle
    phaseImage.src = "assets/ready.svg";
  }

  // Only change facts when phase actually changes to avoid refreshing every second
  if (phase !== window._lastPhase) {
    if (phase === "break") {
      if (typeof showFact === "function") showFact();
    } else if (window._lastPhase === "break") {
      if (typeof hideFact === "function") hideFact();
    }
    window._lastPhase = phase;
  }

  timeText.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  progressText.textContent =
    phase === "ready"
      ? "Select a cycle to start"
      : `Cycle ${repetition} of ${total}`;
}

// Sound toggle
soundBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  backgroundMusic.volume = soundEnabled ? 0.3 : 0;
  // Update icon
  soundBtn.innerHTML = soundEnabled ? '<i class="bi bi-volume-up"></i>' : '<i class="bi bi-volume-mute"></i>';
});

// Ensure initial sound icon matches state
if (soundEnabled && soundBtn) soundBtn.innerHTML = '<i class="bi bi-volume-up"></i>';

// Pause button — delegate to pomodoro logic
pauseBtn.addEventListener("click", () => {
  if (typeof togglePause === "function") {
    const paused = togglePause();
    if (typeof setPauseButtonText === 'function') setPauseButtonText(paused ? "Resume" : "Pause");
  }
});

// Helpers for pomodoro.js to control pause button without touching DOM directly
window.setPauseButtonDisabled = function(disabled) {
  if (pauseBtn) pauseBtn.disabled = disabled;
};

window.setPauseButtonText = function(text) {
  if (!pauseBtn) return;
  // Use icons for Pause/Resume
  if (typeof text === 'string' && text.toLowerCase().includes('pause')) {
    pauseBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
    pauseBtn.setAttribute('aria-label', 'Pause');
  } else {
    pauseBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
    pauseBtn.setAttribute('aria-label', 'Resume');
  }
};


