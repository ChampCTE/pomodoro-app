**Pomodoro Timer**

**Project Overview:**
- A lightweight Pomodoro web app implementing study/work and break cycles with a visual timer, phase illustrations, sounds, facts on breaks, and persistent usage statistics.

**Languages:**
- HTML
- CSS
- JavaScript

**Project Structure:**
- index.html — main page and markup (modals, controls, canvas for stats)
- css/
  - style.css — all styles and responsive rules
- js/
  - cycles.js — cycle definitions (Classic, Short, Long, temporary Test 50s)
  - facts.js — facts module and show/hide functions
  - pomodoro.js — timer and statistics logic (localStorage persistence)
  - ui.js — UI wiring and DOM interactions (buttons, modals, canvas drawing)
- assets/ — images and audio used by the app

**How to run:**
- Open `index.html` in a browser (no server required).
- Select a cycle to prepare the timer, click the green Play icon to start, use the red Pause icon to pause/resume.
- Click the pie-chart Stats icon to view persisted statistics.

**Data & Persistence:**
- Usage statistics (total focused time, breaks taken, sessions completed/abandoned) are stored in `localStorage` under the key `pomodoroStats`.

**Credits & Attributions:**
- Music
  - "Meditación Espiritual (Pure Theta 4.7Hz with Emotional Piano Music)" — © Olexy (Pixabay License)
  - "Microwave Timer" — via Pixabay License
  - "Tada Fanfare A" — via Pixabay License

- Art & Design
  - Visual inspiration from TomatoTimers.com
