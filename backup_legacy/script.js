// === Kullanacağın coin listesi ===
const COINS = [
  "PEPE",
  "OM",
  "HBAR",
  "XLM",
  "ETH",
  "SKL",
  "SANTOS",
  "CITY",
  "JUV",
];

// === TradingView linkleri (tıklayınca grafik buraya set edilecek) ===
const tradingViewWidgets = {
  ETH: "https://s.tradingview.com/widgetembed/?symbol=BINANCE:ETHUSDT&interval=60&theme=dark&style=1",
  PEPE: "https://s.tradingview.com/widgetembed/?symbol=BINANCE:PEPEUSDT&interval=60&theme=dark&style=1",
  OM: "https://s.tradingview.com/widgetembed/?symbol=BINANCE:OMUSDT&interval=60&theme=dark&style=1",
  HBAR: "https://s.tradingview.com/widgetembed/?symbol=BINANCE:HBARUSDT&interval=60&theme=dark&style=1",
  SKL: "https://s.tradingview.com/widgetembed/?symbol=BINANCE:SKLUSDT&interval=60&theme=dark&style=1",
  XLM: "https://s.tradingview.com/widgetembed/?symbol=BINANCE:XLMUSDT&interval=60&theme=dark&style=1",
  SANTOS:
    "https://s.tradingview.com/widgetembed/?symbol=BINANCE:SANTOSUSDT&interval=60&theme=dark&style=1",
  CITY: "https://s.tradingview.com/widgetembed/?symbol=BINANCE:CITYUSDT&interval=60&theme=dark&style=1",
  JUV: "https://s.tradingview.com/widgetembed/?symbol=BINANCE:JUVUSDT&interval=60&theme=dark&style=1",
};

// === Birincil logo kaynakları (yüksek kapsama) ===
const LOGO_URLS = {
  ETH: "https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=029",
  XLM: "https://cryptologos.cc/logos/stellar-xlm-logo.svg?v=029",
  HBAR: "https://cryptologos.cc/logos/hedera-hbar-hbar-logo.svg?v=029",
  OM: "https://cryptologos.cc/logos/mantra-om-om-logo.svg?v=029",
  PEPE: "https://cryptologos.cc/logos/pepe-pepe-logo.svg?v=029",
  SKL: "https://cryptologos.cc/logos/skale-network-skl-logo.svg?v=029",
  SANTOS:
    "https://cryptologos.cc/logos/santos-fc-fan-token-santos-logo.svg?v=029",
  CITY: "https://cryptologos.cc/logos/manchester-city-fan-token-city-logo.svg?v=029",
  JUV: "https://cryptologos.cc/logos/juventus-fan-token-juv-logo.svg?v=029",
};

// === Rozet rengi (fallback) ===
function colorFor(symbol) {
  let h = 0;
  for (let i = 0; i < symbol.length; i++)
    h = (h * 31 + symbol.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return `linear-gradient(145deg,hsl(${hue} 70% 45%),hsl(${
    (hue + 25) % 360
  } 70% 37%))`;
}

// === Aktif ikon vurgusu + grafiği set et ===
function setActive(symbol) {
  const url = tradingViewWidgets[symbol];
  if (!url) return;
  document.getElementById("realChartIframe").src = url;

  const bar = document.getElementById("realIconOverlay");
  bar
    .querySelectorAll(".coin-wrap")
    .forEach((el) => el.classList.remove("active"));
  const current = bar.querySelector(`[data-sym="${symbol}"]`);
  if (current) current.classList.add("active");
}

// === Logo (veya rozet) öğesi üret ===
function makeIcon(symbol) {
  const wrap = document.createElement("div");
  wrap.className = "coin-wrap";
  wrap.dataset.sym = symbol;

  // logo
  const img = document.createElement("img");
  img.className = "coin-img";
  img.alt = symbol + " logo";

  // rozet fallback
  const chip = document.createElement("div");
  chip.className = "coin-chip";
  chip.style.display = "none";
  chip.textContent =
    symbol.replace(/[^A-Z]/g, "").slice(0, 3) ||
    symbol.slice(0, 3).toUpperCase();
  chip.style.background = colorFor(symbol);

  wrap.appendChild(img);
  wrap.appendChild(chip);

  const s = symbol.toLowerCase();
  const tryOrder = [
    LOGO_URLS[symbol], // önce yüksek kapsama logosu
    `https://cdn.jsdelivr.net/npm/cryptocurrency-icons@0.18.0/svg/color/${s}.svg`, // olmazsa bu
  ].filter(Boolean);

  let i = 0;
  function loadNext() {
    if (i >= tryOrder.length) {
      img.style.display = "none";
      chip.style.display = "grid";
      return;
    }
    img.src = tryOrder[i++];
  }
  img.onerror = loadNext;
  img.onload = () => {}; // başarı
  loadNext();

  // etkileşim: tıkla veya üzerine gel
  wrap.addEventListener("click", () => setActive(symbol));
  wrap.addEventListener("mouseenter", () => setActive(symbol));

  return wrap;
}

// === Başlat ===
document.addEventListener("DOMContentLoaded", () => {
  const bar = document.getElementById("realIconOverlay");
  bar.innerHTML = "";
  COINS.forEach((sym) => bar.appendChild(makeIcon(sym)));

  // Varsayılan grafik
  setActive("PEPE"); // istersen "XLM" yap
});
