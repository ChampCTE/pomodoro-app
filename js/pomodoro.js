// js/pomodoro.js

// Pomodoro Timer Logic
let interval = null;
let isPaused = false;

let selectedCycle = null;
let currentPhase = "ready";
let currentRepetition = 1;

// Stats (persisted to localStorage)
let stats = {
  totalFocusSeconds: 0,
  breaksTaken: 0,
  sessionsCompleted: 0,
  sessionsAbandoned: 0
};

function loadStats() {
  try {
    const raw = localStorage.getItem('pomodoroStats');
    if (raw) {
      const parsed = JSON.parse(raw);
      stats = Object.assign(stats, parsed);
    }
  } catch (err) {
    console.warn('loadStats failed', err);
  }
}

function saveStats() {
  try {
    localStorage.setItem('pomodoroStats', JSON.stringify(stats));
  } catch (err) {
    console.warn('saveStats failed', err);
  }
}

// track when a work phase started to measure actual focused seconds
let workPhaseStartTime = null;
let remainingTime = 25 * 60; // seconds

// Start Pomodoro with selected cycle
function preparePomodoro(cycle) {
  // If a session was running, mark it as abandoned before changing selection
  if (interval && currentPhase !== 'ready') {
    clearInterval(interval);
    interval = null;
    isPaused = false;
    stats.sessionsAbandoned = (stats.sessionsAbandoned || 0) + 1;
    saveStats();
  }

  selectedCycle = cycle;
  currentPhase = "ready";
  currentRepetition = 1;
  remainingTime = Math.round(selectedCycle.work * 60);
  isPaused = false;

  if (typeof setPauseButtonDisabled === "function") setPauseButtonDisabled(true);
  if (typeof setPauseButtonText === "function") setPauseButtonText("Pause");

  // show timer UI
  if (typeof showTimer === "function") showTimer();

  refreshScreen();
}

// Start Pomodoro - can be called without args if a cycle was prepared)
function startPomodoro(cycle) {
  if (cycle) selectedCycle = cycle;
  if (!selectedCycle) {
    console.warn('startPomodoro: no cycle selected');
    return;
  }

  currentPhase = "work";
  currentRepetition = 1;
  remainingTime = Math.round(selectedCycle.work * 60);
  isPaused = false;

  // record when work phase started
  workPhaseStartTime = Date.now();

  if (typeof setPauseButtonDisabled === "function") setPauseButtonDisabled(false);
  if (typeof setPauseButtonText === "function") setPauseButtonText("Pause");

  // show timer UI
  if (typeof showTimer === "function") showTimer();

  refreshScreen();
  startCountdown();
}

// start the countdown timer
function startCountdown() {
  if (interval) clearInterval(interval);

  interval = setInterval(() => {
    if (!isPaused) {
      remainingTime--;

      if (remainingTime <= 0) {
        changePhase();
      }

      refreshScreen();
    }
  }, 1000);
}

// Expose togglePause for UI to call
function togglePause() {
  isPaused = !isPaused;
  if (typeof setPauseButtonText === "function") setPauseButtonText(isPaused ? "Resume" : "Pause");
  return isPaused;
}
window.togglePause = togglePause;

// Change phase between work and break
function changePhase() {
  if (soundEnabled) phaseSound.play().catch(err => console.warn('phaseSound.play failed', err));

  if (currentPhase === "work") {
    // finishing a work phase — measure elapsed focused seconds
    if (workPhaseStartTime) {
      const elapsed = Math.round((Date.now() - workPhaseStartTime) / 1000);
      stats.totalFocusSeconds = (stats.totalFocusSeconds || 0) + elapsed;
      workPhaseStartTime = null;
    }
    // increment breaks taken
    stats.breaksTaken = (stats.breaksTaken || 0) + 1;
    saveStats();

    currentPhase = "break";
    remainingTime = selectedCycle.breakTime * 60;
  } else {
    currentRepetition++;

    if (currentRepetition > selectedCycle.repetitions) {
      finishPomodoro();
      return;
    }

    currentPhase = "work";
    remainingTime = selectedCycle.work * 60;
    // mark new work period start
    workPhaseStartTime = Date.now();
  }
}

//Update the UI with current timer state
function refreshScreen() {
  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  updateUI(
    currentPhase,
    minutes,
    seconds,
    currentRepetition,
    selectedCycle.repetitions
  );
}

// Finish the Pomodoro session
function finishPomodoro() {
  clearInterval(interval);
  backgroundMusic.pause();
  if (soundEnabled) endSound.play();

  if (typeof setPauseButtonDisabled === "function") setPauseButtonDisabled(true);
  currentPhase = "ready";
  updateUI("ready", 25, 0, 0, 0);
  // record completion
  stats.sessionsCompleted = (stats.sessionsCompleted || 0) + 1;
  saveStats();

  // Show in-app completion modal (uses Bootstrap modal)
  try {
    const modalEl = document.getElementById('doneModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const body = modalEl.querySelector('.modal-body');
      if (body) body.textContent = 'Pomodoro is complete! Now you can take a break or start a new session';
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    } else {
      // Fallback to alert if modal or bootstrap not available
      alert('Pomodoro is complete! Now you can take a break or start a new session');
    }
  } catch (err) {
    console.warn('finishPomodoro: failed to show modal', err);
    alert('Pomodoro is complete! Now you can take a break or start a new session');
  }
}

// Expose startPomodoro to global scope
window.startPomodoro = startPomodoro;
window.preparePomodoro = preparePomodoro;

// load persisted stats on script load
loadStats();

