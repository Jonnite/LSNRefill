async function fetchPOIs() {
  const res = await fetch("data.json");
  const data = await res.json();
  return data;
}

function getNextRefillTime(refillTimeStr) {
  const now = new Date();
  
  const [h, m] = refillTimeStr.split(":").map(Number);

  const utcMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  
  const ukDate = new Date(utcMidnight);
  ukDate.setUTCHours(h, m, 0, 0);

  // Get UK timezone offset in minutes for now
  const ukOffsetMinutes = -new Date().toLocaleString('en-GB', { timeZone: 'Europe/London', timeZoneName: 'short' }).includes('BST') ? 60 : 0;

  // Now create refill time in UTC: subtract offset so refillTimeUTC = UK local time
  const refillUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), h, m, 0));

  // Add BST offset if needed (+1 hour = 60 mins)
  const bstOffsetMs = (ukOffsetMinutes === 60 ? 60 : 0) * 60 * 1000;
  const refill = new Date(refillUTC.getTime() - bstOffsetMs);

  // If refill <= now, add 30 min intervals
  while (refill <= now) {
    refill.setTime(refill.getTime() + 30 * 60 * 1000);
  }

  return refill;
}

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
      <img src="${poi.image}" alt="${poi.name}">
      <div class="info">
        <div class="name">${poi.name}</div>
        <div class="shard">Shard ${poi.shard}</div>
        <div class="timer">Refills In ${timerText}</div>
      </div>
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
