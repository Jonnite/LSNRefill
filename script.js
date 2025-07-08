async function fetchPOIs() {
  const res = await fetch("data.json");
  const data = await res.json();
  return data;
}

function getNextRefillTime(refillTimeStr) {
  const now = new Date();
  const [baseH, baseM] = refillTimeStr.split(":").map(Number);

  // Create a Date object for today at the POI's base refill time in local time
  const baseRefill = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    baseH,
    baseM,
    0,
    0
  );

  // Calculate difference in ms between now and base refill
  let diff = now - baseRefill;

  if (diff < 0) {
    // base refill time is still in the future today, so next refill is at baseRefill
    return baseRefill;
  }

  // Calculate how many 30-min intervals have passed since base refill time
  const intervalsPassed = Math.floor(diff / (30 * 60 * 1000)) + 1;

  // Calculate next refill time by adding intervalsPassed * 30 mins to base refill time
  const nextRefill = new Date(baseRefill.getTime() + intervalsPassed * 30 * 60 * 1000);

  return nextRefill;
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
