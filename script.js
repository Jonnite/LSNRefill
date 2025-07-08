async function fetchPOIs() {
  const res = await fetch("data.json");
  const data = await res.json();
  return data;
}

function getNextRefillTime(refillTimeStr) {
  const now = new Date();
  const [h, m] = refillTimeStr.split(":").map(Number);

  const refill = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);

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
