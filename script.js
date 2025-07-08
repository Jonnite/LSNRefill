// Fetch POI data from data.json
async function fetchPOIs() {
  const res = await fetch("data.json");
  const data = await res.json();
  return data;
}

// Calculate the next refill time, cycles every 30 mins starting from base refill time (with optional seconds)
function getNextRefillTime(refillTimeStr) {
  const now = new Date();
  const parts = refillTimeStr.split(":").map(Number);
  const baseH = parts[0];
  const baseM = parts[1];
  const baseS = parts[2] || 0;  // Default to 0 seconds if not provided

  // Base refill time today
  let baseRefill = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    baseH,
    baseM,
    baseS,
    0
  );

  // If base refill time today is in the future, cycle started yesterday
  if (baseRefill > now) {
    baseRefill = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1,
      baseH,
      baseM,
      baseS,
      0
    );
  }

  // Calculate how many 30-minute intervals have passed since base refill
  const refillIntervalMs = (30 * 60 + 1) * 1000;
  const diffMs = now - baseRefill;
  const intervalsPassed = Math.floor(diffMs / refillIntervalMs) + 1;

  // Next refill time is base refill + intervalsPassed * 30 minutes
  const nextRefill = new Date(baseRefill.getTime() + intervalsPassed * refillIntervalMs);

  return nextRefill;
}

// Update the POI list UI sorted by next refill soonest
function updateList(poiData) {
  const container = document.getElementById("poi-list");
  const now = new Date();

  const sorted = poiData.map(poi => {
    const next = getNextRefillTime(poi.refillTime);
    const timeLeft = next - now;
    return { ...poi, timeLeft };
  }).sort((a, b) => a.timeLeft - b.timeLeft);

  container.innerHTML = "";

  sorted.forEach(poi => {
    const minutes = Math.floor(poi.timeLeft / 60000);
    const seconds = Math.floor((poi.timeLeft % 60000) / 1000);
    const timerText = `${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${poi.image}" alt="${poi.name}" />
      <div class="info">
        <div class="name">${poi.name}</div>
        <div class="timer">Refill in ${timerText}</div>
      </div>
      <div class="shard">${poi.shard}</div>
    `;
    container.appendChild(card);
  });
}

let poiList = [];

fetchPOIs().then(data => {
  poiList = data;
  updateList(poiList);
  setInterval(() => updateList(poiList), 1000);
});
