// js/facts.js

// Facts Module
const facts = [
  "In the 1940s, biochemist Gerty Cori became the first woman to win a Nobel Prize in Physiology or Medicine, paving the way for future female scientists in metabolic research.",
  "Physicist Chien-Shiung Wu’s groundbreaking work in nuclear physics helped reshape our understanding of particle behavior, despite her being long overlooked by early Nobel committees.",
  "Painter Artemisia Gentileschi defied social barriers in the 1600s, using dramatic light and emotion to bring women’s strength and suffering to the forefront of Baroque art.",
  "The Amur leopard, one of the world’s rarest big cats, thrives again thanks to conservation efforts — its population has doubled in the past decade after near extinction.",
  "Lions and tigers, though strong hunters, depend heavily on healthy ecosystems; protecting their forests and grasslands supports countless other species too.",
  "By 2028, NASA’s Artemis program aims to land the first woman on the Moon, marking a milestone for human exploration and equality in space science.",
  "The 2030s may begin with the dawn of the first commercial space hotel in low Earth orbit, offering a glimpse into humanity’s next great adventure beyond our planet.",
  "In the 1950s, Rosalind Franklin’s work on X-ray diffraction was crucial to discovering the structure of DNA, yet her contribution was largely unrecognized during her lifetime.",
  "Jocelyn Bell Burnell discovered the first pulsars as a graduate student in 1967, a breakthrough in astrophysics that later won a Nobel Prize—though not awarded to her.",
  "Hilma af Klint created abstract paintings years before Kandinsky, but her work remained hidden for decades because she believed the world was not ready for it.",
  "Snow leopards cannot roar like other big cats due to differences in their vocal anatomy, but they can purr, chirp, and produce eerie, ghost-like calls.",
  "Jaguars have the strongest bite force of any big cat relative to size, allowing them to pierce turtle shells and even caiman skulls with ease.",
  "Between 2026 and 2030, NASA’s Artemis missions aim to establish a sustained human presence on the Moon, including a space station orbiting it called Gateway.",
  "In the late 2020s, astronomers expect major discoveries from next-generation telescopes that could detect atmospheric signs of life on exoplanets for the first time."
];

// Function to get a random fact
function getRandomFact() {
  const index = Math.floor(Math.random() * facts.length);
  return facts[index];
}
// Show and hide fact functions
window.showFact = function () {
  const container = document.getElementById("facts-container");
  if (!container) return;

  container.innerHTML = `
    <div class="card shadow-sm">
      <div class="card-body">
        <h6 class="card-title fw-bold"><i class="bi bi-lightbulb-fill"></i> Did you know?</h6>
        <p class="card-text">${getRandomFact()}</p>
      </div>
    </div>
  `;

  container.classList.remove("d-none");
};
// Hide fact
window.hideFact = function () {
  const container = document.getElementById("facts-container");
  if (container) container.classList.add("d-none");
};