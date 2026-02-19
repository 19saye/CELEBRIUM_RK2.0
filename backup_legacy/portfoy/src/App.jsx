import React, { useEffect, useMemo, useRef, useState } from "react";

/*
Küçük yardımcılar / ortak fonksiyonlar
 */

// mini svg rozet (data-uri)
const svgBadgeDataUri = (text = "SYM", fill = "#666") => {
  const svg = `
<svg xmlns='http://www.w3.org/2000/svg' width='56' height='24'>
  <rect rx='12' ry='12' x='0' y='0' width='56' height='24' fill='${fill}' />
  <text x='28' y='16' text-anchor='middle' font-family='system-ui, -apple-system, Segoe UI, Roboto, Arial'
        font-size='12' font-weight='700' fill='white'>${text}</text>
</svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
};

function DataSourceTag() {
  return (
    <span
      className="muted"
      title="Öncelik: CoinGecko • Sorun olursa: Binance USDT + USD/TRY çarpanı"
      style={{ fontSize: 12 }}
    >
      Veri kaynağı: CoinGecko (fallback: Binance)
    </span>
  );
}
// CoinGecko fetch (pro key opsiyonel) + timeout + 45s URL cache
const _cgCache = new Map(); // url -> { t, data }

const cgFetch = async (url, { timeoutMs = 6000, cacheTtlMs = 45000 } = {}) => {
  const now = Date.now();
  const hit = _cgCache.get(url);
  if (hit && now - hit.t < cacheTtlMs) {
    return hit.data;
  }

  const key = import.meta.env.VITE_CG_KEY?.trim();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort("timeout"), timeoutMs);

  try {
    const r = await fetch(url, {
      signal: ctrl.signal,
      headers: key ? { "x-cg-pro-api-key": key } : undefined,
    });
    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      console.error("CoinGecko error", r.status, txt);
      throw new Error("cg error " + r.status);
    }
    const data = await r.json();
    _cgCache.set(url, { t: now, data });
    return data;
  } finally {
    clearTimeout(timer);
  }
};

//  yalnızca bir useLocalStorage
const useLocalStorage = (key, initial) => {
  const [val, setVal] = useState(() => {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  }, [key, val]);
  return [val, setVal];
};

// Pazar verisi: CoinGecko markets
async function fetchMarkets(symbols) {
  if (!symbols?.length) return {};
  const map = {
    BTC: "bitcoin",
    ETH: "ethereum",
    XLM: "stellar",
    HBAR: "hedera-hashgraph",
    OM: "mantra-dao",
    SKL: "skale",
    PEPE: "pepe",
    SANTOS: "santos-fc-fan-token",
    CITY: "manchester-city-fan-token",
    JUV: "juventus-fan-token",
  };
  const ids = symbols.map((s) => map[s.toUpperCase()]).filter(Boolean);
  if (!ids.length) return {};

  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=try&ids=${ids.join(
    ","
  )}&price_change_percentage=24h,7d,30d`;

  try {
    const arr = await cgFetch(url);
    const reverse = Object.fromEntries(
      Object.entries(map).map(([k, v]) => [v, k])
    );
    const out = {};
    for (const it of arr) {
      const sym = reverse[it.id] || it.symbol.toUpperCase();
      out[sym] = {
        priceTRY: it.current_price,
        pct24h:
          it.price_change_percentage_24h_in_currency ??
          it.price_change_percentage_24h,
        pct7d: it.price_change_percentage_7d_in_currency,
        pct30d: it.price_change_percentage_30d_in_currency,
      };
    }
    return out;
  } catch (e) {
    console.error("markets fetch error", e);
    return {};
  }
}

/* 
Sol Canlı Ticker (sadece diğer sekmelerde)
 */

function CoinTickerLeft({
  symbols = [
    "ETH",
    "PEPE",
    "OM",
    "HBAR",
    "XLM",
    "SKL",
    "SANTOS",
    "CITY",
    "JUV",
  ],
}) {
  const idMap = {
    ETH: "ethereum",
    PEPE: "pepe",
    OM: "mantra-dao",
    HBAR: "hedera-hashgraph",
    XLM: "stellar",
    SKL: "skale",
    SANTOS: "santos-fc-fan-token",
    CITY: "manchester-city-fan-token",
    JUV: "juventus-fan-token",
  };
  const [rows, setRows] = useState([]);

  async function load() {
    const ids = symbols.map((s) => idMap[s]).filter(Boolean);
    if (!ids.length) return;
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=try&ids=${ids.join(
      ","
    )}&price_change_percentage=24h`;
    try {
      const data = await cgFetch(url);
      const rev = Object.fromEntries(
        Object.entries(idMap).map(([k, v]) => [v, k])
      );
      setRows(
        data.map((d) => ({
          sym: rev[d.id] || d.symbol.toUpperCase(),
          price: d.current_price,
          pct24:
            d.price_change_percentage_24h_in_currency ??
            d.price_change_percentage_24h,
        }))
      );
    } catch (e) {
      console.warn("CG down", e);
      setRows([]);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <aside className="side-ticker">
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Canlı Ticker</div>
      {rows.map((r, i) => (
        <div key={i} className="item" style={{ display: "flex", gap: 8 }}>
          <span className="sym" style={{ width: 56 }}>
            {r.sym}
          </span>
          <span className="price" style={{ flex: 1 }}>
            {isFinite(r.price) ? r.price.toLocaleString("tr-TR") : "-"}
          </span>
          <span
            className={`pct ${r.pct24 >= 0 ? "up" : "down"}`}
            style={{ width: 64, textAlign: "right" }}
          >
            {isFinite(r.pct24) ? r.pct24.toFixed(2) + "%" : "-"}
          </span>
        </div>
      ))}
      {!rows.length && (
        <div className="muted" style={{ padding: "6px 0" }}>
          yükleniyor…
        </div>
      )}
    </aside>
  );
}

/* 
      Portföy Tablosu (READ-ONLY)
 */

function Portfolio() {
  const [rows] = useLocalStorage("pf_rows", [
    { exchange: "Midas", symbol: "ETH", amount: 0.25, buyPriceTRY: 120000 },
    { exchange: "Binance", symbol: "XLM", amount: 100, buyPriceTRY: 10.5 },
  ]);

  const [prices, setPrices] = useState({});

  // TradingView modal state
  const [tvOpen, setTvOpen] = useState(false);
  const [tvSymbol, setTvSymbol] = useState("ETH");
  const tvMap = {
    ETH: "BINANCE:ETHUSDT",
    PEPE: "BINANCE:PEPEUSDT",
    OM: "BINANCE:OMUSDT",
    HBAR: "BINANCE:HBARUSDT",
    SKL: "BINANCE:SKLUSDT",
    XLM: "BINANCE:XLMUSDT",
    SANTOS: "BINANCE:SANTOSUSDT",
    CITY: "BINANCE:CITYUSDT",
    JUV: "BINANCE:JUVUSDT",
  };
  const tvUrl = (sym) =>
    `https://s.tradingview.com/widgetembed/?symbol=${
      tvMap[sym] || "BINANCE:ETHUSDT"
    }&interval=60&theme=dark&style=1`;

  const symbols = useMemo(
    () => [...new Set(rows.map((r) => r.symbol.toUpperCase()))],
    [rows]
  );

  useEffect(() => {
    let live = true;
    (async () => {
      const d = await fetchMarkets(symbols);
      if (live) setPrices(d);
    })();
    const id = setInterval(async () => {
      const d = await fetchMarkets(symbols);
      if (live) setPrices(d);
    }, 60_000);
    return () => {
      live = false;
      clearInterval(id);
    };
  }, [JSON.stringify(symbols)]);

  // yardımcılar
  const estPL = (val, pct) =>
    pct == null ? 0 : (val * (pct / 100)) / (1 + pct / 100);
  const fmt = (n) => (isFinite(n) ? n.toLocaleString("tr-TR") : "-");
  const pc = (n) => (n == null || !isFinite(n) ? "-" : `${n.toFixed(2)}%`);

  // toplamlar
  const totals = useMemo(() => {
    let invTRY = 0,
      valTRY = 0,
      pl24 = 0,
      pl7 = 0,
      pl30 = 0;
    rows.forEach((r) => {
      const price = prices[r.symbol]?.priceTRY || 0;
      const value = price * r.amount;
      invTRY += r.buyPriceTRY * r.amount;
      valTRY += value;
      pl24 += estPL(value, prices[r.symbol]?.pct24h);
      pl7 += estPL(value, prices[r.symbol]?.pct7d);
      pl30 += estPL(value, prices[r.symbol]?.pct30d);
    });
    const pnlTRY = valTRY - invTRY;
    const pct = invTRY ? (pnlTRY / invTRY) * 100 : 0;
    return { invTRY, valTRY, pnlTRY, pct, pl24, pl7, pl30 };
  }, [rows, prices]);

  return (
    <div className="card">
      <div className="hd">
        <strong>Aktif Yatırımlar</strong>{" "}
        <span className="muted">• 24s/7g/30g performans + canlı fiyat</span>
        <span style={{ marginLeft: 8 }}>
          <DataSourceTag />
        </span>
      </div>

      <div className="bd">
        {/* Özet pill'ler */}
        <div className="row" style={{ marginBottom: 12 }}>
          <div
            className="col-12"
            style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
          >
            <span className={`pill ${totals.pl24 >= 0 ? "up" : "down"}`}>
              24s Toplam P/L: {fmt(totals.pl24)}
            </span>
            <span className={`pill ${totals.pl7 >= 0 ? "up" : "down"}`}>
              7g Toplam P/L: {fmt(totals.pl7)}
            </span>
            <span className={`pill ${totals.pl30 >= 0 ? "up" : "down"}`}>
              30g Toplam P/L: {fmt(totals.pl30)}
            </span>
            <span className={`pill ${totals.pnlTRY >= 0 ? "up" : "down"}`}>
              Anlık Toplam P/L: {fmt(totals.pnlTRY)} ({totals.pct.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Tablo */}
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Borsa</th>
                <th>Sembol</th>
                <th>Miktar</th>
                <th>Alış (TRY)</th>
                <th>Fiyat (TRY)</th>
                <th>Değer (TRY)</th>
                <th>%24s</th>
                <th>%7g</th>
                <th>%30g</th>
                <th>24s P/L (TRY)</th>
                <th>7g P/L (TRY)</th>
                <th>30g P/L (TRY)</th>
                <th>Grafik</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const priceTry = prices[r.symbol]?.priceTRY ?? 0;
                const value = priceTry * r.amount;

                const pct24 = prices[r.symbol]?.pct24h ?? null;
                const pct7 = prices[r.symbol]?.pct7d ?? null;
                const pct30 = prices[r.symbol]?.pct30d ?? null;

                const pl24 = estPL(priceTry * r.amount, pct24);
                const pl7 = estPL(priceTry * r.amount, pct7);
                const pl30 = estPL(priceTry * r.amount, pct30);

                return (
                  <tr key={i}>
                    <td>{r.exchange}</td>
                    <td>{r.symbol}</td>
                    <td>{r.amount}</td>
                    <td>{fmt(r.buyPriceTRY)}</td>
                    <td>{priceTry ? priceTry.toLocaleString("tr-TR") : "-"}</td>
                    <td>{value ? value.toLocaleString("tr-TR") : "-"}</td>

                    <td>
                      <span className={`pill ${pct24 >= 0 ? "up" : "down"}`}>
                        {pc(pct24)}
                      </span>
                    </td>
                    <td>
                      <span className={`pill ${pct7 >= 0 ? "up" : "down"}`}>
                        {pc(pct7)}
                      </span>
                    </td>
                    <td>
                      <span className={`pill ${pct30 >= 0 ? "up" : "down"}`}>
                        {pc(pct30)}
                      </span>
                    </td>

                    <td style={{ color: pl24 >= 0 ? "#34d399" : "#fb7185" }}>
                      {isFinite(pl24) ? fmt(pl24) : "-"}
                    </td>
                    <td style={{ color: pl7 >= 0 ? "#34d399" : "#fb7185" }}>
                      {isFinite(pl7) ? fmt(pl7) : "-"}
                    </td>
                    <td style={{ color: pl30 >= 0 ? "#34d399" : "#fb7185" }}>
                      {isFinite(pl30) ? fmt(pl30) : "-"}
                    </td>

                    <td>
                      <button
                        className="btn"
                        onClick={() => {
                          setTvSymbol(r.symbol);
                          setTvOpen(true);
                        }}
                      >
                        Aç
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* TradingView Modal */}
      <div
        className={`modal-backdrop ${tvOpen ? "open" : ""}`}
        onClick={() => setTvOpen(false)}
      >
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="hd">
            <strong>{tvSymbol} • Canlı Grafik</strong>
            <button className="btn ghost" onClick={() => setTvOpen(false)}>
              Kapat
            </button>
          </div>
          <div className="bd">
            <iframe
              key={tvSymbol}
              src={tvUrl(tvSymbol)}
              title={`tv-${tvSymbol}`}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="fullscreen; clipboard-read; clipboard-write"
              style={{
                width: "100%",
                height: "70vh",
                background: "#0b1220",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* 
    Canlı Bar Grafiği (TRY)
 */

function BarChartLive({
  symbols = [
    "ETH",
    "PEPE",
    "OM",
    "HBAR",
    "XLM",
    "SKL",
    "SANTOS",
    "CITY",
    "JUV",
  ],
}) {
  const idMap = {
    ETH: "ethereum",
    PEPE: "pepe",
    OM: "mantra-dao",
    HBAR: "hedera-hashgraph",
    XLM: "stellar",
    SKL: "skale",
    SANTOS: "santos-fc-fan-token",
    CITY: "manchester-city-fan-token",
    JUV: "juventus-fan-token",
  };
  const colorMap = {
    ETH: "#f59e0b",
    PEPE: "#22c55e",
    OM: "#e879f9",
    HBAR: "#a78bfa",
    XLM: "#38bdf8",
    SKL: "#14b8a6",
    SANTOS: "#eab308",
    CITY: "#60a5fa",
    JUV: "#fb7185",
  };

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState(null);

  async function load() {
    const ids = symbols.map((s) => idMap[s]).filter(Boolean);
    if (!ids.length) return;
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=try&ids=${ids.join(
      ","
    )}&price_change_percentage=24h`;

    try {
      setLoading(true);
      const data = await cgFetch(url);
      const reverse = Object.fromEntries(
        Object.entries(idMap).map(([k, v]) => [v, k])
      );
      const next = data
        .map((d) => ({
          sym: reverse[d.id] || d.symbol.toUpperCase(),
          price: d.current_price,
          pct24:
            d.price_change_percentage_24h_in_currency ??
            d.price_change_percentage_24h,
        }))
        .filter((x) => Number.isFinite(x.price));
      setRows(next);
    } catch (e) {
      console.error("BarChartLive fetch error", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  if (!rows.length) {
    return (
      <div className="card">
        <div className="hd">
          <strong>Canlı Coin Bar Grafiği (TRY)</strong>
        </div>
        <div className="bd">veri yükleniyor…</div>
      </div>
    );
  }

  const max = Math.max(...rows.map((r) => r.price)) || 1;

  return (
    <div className="card">
      <div className="hd">
        <strong>Canlı Coin Bar Grafiği (TRY)</strong>
        {loading && (
          <span className="muted" style={{ marginLeft: 8 }}>
            • güncelleniyor…
          </span>
        )}
      </div>

      <div className="bd">
        <div className="bars" style={{ height: 360 }}>
          {rows.map((r, i) => {
            const hPct = Math.max(2, (r.price / max) * 100);
            const color = colorMap[r.sym] || "#888";
            return (
              <div
                key={i}
                className="bar"
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "flex-end",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHover({
                    sym: r.sym,
                    price: r.price,
                    pct24: r.pct24,
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                  });
                }}
                onMouseMove={(e) =>
                  setHover((old) =>
                    old ? { ...old, x: e.clientX, y: e.clientY - 20 } : old
                  )
                }
                onMouseLeave={() => setHover(null)}
              >
                <img
                  className="badge"
                  src={svgBadgeDataUri(r.sym, color)}
                  alt={r.sym}
                  draggable={false}
                  style={{
                    position: "absolute",
                    top: -28,
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                />
                <div
                  className="bar-body"
                  style={{
                    height: `${hPct}%`,
                    width: "70%",
                    margin: "0 auto",
                    background: color,
                    borderRadius: 8,
                    transition: "height .35s ease",
                  }}
                />
                <div
                  className="muted"
                  style={{
                    position: "absolute",
                    bottom: -22,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: 12,
                  }}
                >
                  {r.price.toLocaleString("tr-TR")}
                </div>
              </div>
            );
          })}
        </div>

        {hover && (
          <div
            className="tooltip"
            style={{
              position: "fixed",
              left: hover.x + 12,
              top: hover.y + 12,
              zIndex: 9999,
              background: "#0f1522",
              border: "1px solid #1f2a3c",
              padding: "8px 10px",
              borderRadius: 10,
              boxShadow: "0 10px 24px rgba(0,0,0,.35)",
              minWidth: 140,
            }}
          >
            <div style={{ marginBottom: 4 }}>
              <strong>{hover.sym}</strong>
            </div>
            <div>Fiyat: {hover.price.toLocaleString("tr-TR")} ₺</div>
            <div className={hover.pct24 >= 0 ? "up" : "down"}>
              24s:{" "}
              {Number.isFinite(hover.pct24)
                ? hover.pct24.toFixed(2) + "%"
                : "-"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* 
    Sağ Sütun: Hızlı Haberler
 */

function NewsCard() {
  const [items, setItems] = useState([]);
  const [ts, setTs] = useState(null);

  useEffect(() => {
    let live = true;

    async function load() {
      try {
        const r = await fetch(
          "https://api.coinstats.app/public/v1/news?skip=0&limit=8"
        );
        if (!r.ok) throw new Error("news " + r.status);
        const { news } = await r.json();
        if (!live) return;
        setItems(
          (news || []).map((n) => ({
            title: n.title,
            src: n.source,
            url: n.link,
            ago: n.feedDate ? timeAgo(n.feedDate) : "",
          }))
        );
        setTs(Date.now());
      } catch {
        if (!live) return;
        setItems([
          {
            title: "BTC opsiyon açık pozisyonu rekor tazeledi",
            src: "Türev Piyasalar",
            url: "#",
            ago: "şimdi",
          },
          {
            title: "ETH ETF girişleri hızlandı",
            src: "On-chain",
            url: "#",
            ago: "5 dk",
          },
          {
            title: "PEPE 24s hacim +%18",
            src: "Piyasalar",
            url: "#",
            ago: "12 dk",
          },
        ]);
        setTs(Date.now());
      }
    }

    const timeAgo = (ms) => {
      const d = typeof ms === "number" ? ms : new Date(ms).getTime();
      const m = Math.max(0, Math.floor((Date.now() - d) / 60000));
      if (m < 1) return "şimdi";
      if (m < 60) return `${m} dk`;
      const h = Math.floor(m / 60);
      return `${h} sa`;
    };

    load();
    const id = setInterval(load, 180_000);
    return () => {
      live = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="card" style={{ position: "sticky", top: 16 }}>
      <div className="hd" style={{ borderBottom: 0 }}>
        <strong>Hızlı Haberler</strong>
        {ts && (
          <span className="muted" style={{ marginLeft: 8 }}>
            • güncellendi
          </span>
        )}
      </div>
      <div className="bd">
        {items.length === 0 && <div className="muted">yükleniyor…</div>}
        {items.map((n, i) => (
          <a
            key={i}
            href={n.url || "#"}
            target="_blank"
            rel="noreferrer"
            className="news-item"
            style={{
              display: "block",
              padding: "8px 0",
              borderBottom: "1px solid rgba(255,255,255,.06)",
            }}
          >
            <div style={{ fontSize: 14 }}>{n.title}</div>
            <div className="muted" style={{ fontSize: 12 }}>
              {n.src} • {n.ago} önce
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

/* 
    Projeler
*/

function Projects() {
  // Küratörlü, değişmeyen proje listesi (read-only)
  const curated = [
    {
      title: "Prsch_HQC_project – HQC Sensör Şifreleme",
      tags: ["PQC", "HQC", "C", "PQClean"],
      link: "https://github.com/19saye/Prsch_HQC_project/tree/master",
      desc: "Araç sensör verisini HQC-128 ile şifreleyen demo; PQClean tabanlı KEM akışı.",
    },
    {
      title: "Quantum RADAR",
      tags: ["Quantum", "Radar"],
      desc: "Kuantum radar sinyal simülasyonu, gerçek zamanlı kuantum algılama ",
    },
    {
      title: "Portföy Vitrin",
      tags: ["Web", "TradingView"],
      link: "#",
      desc: "TradingView + P/L tablo vitrini.",
    },
  ];

  // Eski localStorage kalıntıları görünümesin diye tek seferlik temizle
  useEffect(() => {
    try {
      localStorage.removeItem("pf_projects");
    } catch {}
  }, []);

  const items = curated;

  return (
    <div className="card">
      <div className="hd">
        <strong>Projeler</strong>
      </div>
      <div className="bd">
        <div className="row" style={{ marginTop: 16 }}>
          {items.map((p, i) => (
            <div key={i} className="col-4">
              <div className="card">
                <div className="hd" style={{ borderBottom: 0 }}>
                  <strong>{p.title}</strong>
                </div>
                <div className="bd">
                  <div className="muted" style={{ marginBottom: 8 }}>
                    {p.desc}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    {p.tags.map((t, ix) => (
                      <span key={ix} className="badge">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <a
                      href={p.link || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="muted"
                      style={{ textDecoration: "underline" }}
                    >
                      {p.link
                        ? p.link.includes("github.com")
                          ? "GitHub’da İncele"
                          : "Bağlantı"
                        : "Bağlantı yok"}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* 
    Vlog
 */

function Vlog() {
  const [links, setLinks] = useLocalStorage("pf_vlogs", [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  ]);
  const [val, setVal] = useState("");
  const add = () => {
    if (!val) return;
    setLinks((prev) => [val, ...prev]);
    setVal("");
  };
  const remove = (i) => setLinks((prev) => prev.filter((_, idx) => idx !== i));

  const embed = (url) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtube.com"))
        return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
      if (u.hostname.includes("youtu.be"))
        return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    } catch {}
    return null;
  };

  return (
    <div className="card">
      <div className="hd">
        <strong>Vlog</strong>
      </div>
      <div className="bd">
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="input"
            placeholder="YouTube bağlantısı yapıştır"
            value={val}
            onChange={(e) => setVal(e.target.value)}
          />
          <button className="btn" onClick={add}>
            + Ekle
          </button>
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          {links.map((l, i) => {
            const src = embed(l);
            return (
              <div key={i} className="col-6">
                <div className="video">
                  {src ? (
                    <iframe
                      src={src}
                      title={`vlog-${i}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <div className="bd">Geçersiz link</div>
                  )}
                </div>
                <div
                  className="ft"
                  style={{ display: "flex", justifyContent: "flex-end" }}
                >
                  <button className="btn ghost" onClick={() => remove(i)}>
                    Sil
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* 
    Beceriler
*/

function Skills() {
  const [list, setList] = useLocalStorage("pf_skills", [
    "Quantum Computing",
    "PQC (HQC)",
    "C / Python",
    "Web (HTML/CSS/JS)",
    "AI-Assisted Security",
  ]);
  const [val, setVal] = useState("");
  const add = () => {
    if (!val) return;
    setList((prev) => [...prev, val]);
    setVal("");
  };
  /* 
  const remove = (i) => setList((prev) => prev.filter((_, idx) => idx !== i));
  return (
    <div className="card">
      <div className="hd">
        <strong>Beceri & Yetenekler</strong>
      </div>
      <div className="bd">
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <input
            className="input"
            placeholder="Yeni etiket"
            value={val}
            onChange={(e) => setVal(e.target.value)}
          />
          <button className="btn" onClick={add}>
            + Ekle
          </button>
        </div>
        <div>
          {list.map((s, i) => (
            <span
              key={i}
              className="badge"
              style={{
                marginRight: 8,
                marginBottom: 8,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {s}{" "}
              <button
                className="btn ghost"
                onClick={() => remove(i)}
                style={{ padding: "2px 6px" }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  ); */
}

/* 
   Dijital İkiz (sağ altta)
 */

function AITwin({ onNavigate }) {
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useLocalStorage("pf_ai_msgs", [
    {
      role: "bot",
      text: "Merhaba, ben Dijital İkiz. 20 saat içinde yayında bir site hedefi için hazırım. Önce portföy mü, projeler mi?",
    },
  ]);
  const boxRef = useRef(null);
  useEffect(() => {
    boxRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [msgs.length]);

  const reply = (t) => {
    const low = t.toLowerCase();
    if (/(yatırım|portföy|borsa|midas|binance|kâr|zarar)/.test(low)) {
      onNavigate("portfolio");
      return "Portföyü açtım. Sembol, miktar ve alış TRY girip + Ekle.";
    }
    if (/(proje|github|repo)/.test(low)) {
      onNavigate("projects");
      return "Projeler bölümüne geçtim. Kart ekleyebilirsin.";
    }
    if (/(vlog|video|youtube)/.test(low)) {
      onNavigate("vlog");
      return "YouTube linkini yapıştır, otomatik gömülür.";
    }
    if (/(beceri|yetenek|cv)/.test(low)) {
      onNavigate("skills");
      return "Etiket ekle; istemediklerini × ile kaldır.";
    }
    return "Merhabalar , Size nasıl yordımcı olabilirim .(eğer tercih ederseniz lütfen dili değiştiriniz :)";
  };

  const send = () => {
    if (!input.trim()) return;
    const t = input.trim();
    setMsgs((prev) => [...prev, { role: "user", text: t }]);
    setInput("");
    const r = reply(t);
    setMsgs((prev) => [...prev, { role: "bot", text: r }]);
  };

  if (!open)
    return (
      <button
        className="btn"
        style={{ position: "fixed", right: 16, bottom: 16, zIndex: 50 }}
        onClick={() => setOpen(true)}
      >
        Rehberi Aç
      </button>
    );

  return (
    <div className="twin">
      <div className="chatbox">
        <div className="hd" style={{ padding: "10px 12px" }}>
          <strong>Dijital İkiz</strong>
          <button
            className="btn ghost"
            style={{ float: "right" }}
            onClick={() => setOpen(false)}
          >
            Kapat
          </button>
        </div>
        <div className="msgs" ref={boxRef}>
          {msgs.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              {m.text}
            </div>
          ))}
        </div>
        <div className="send">
          <input
            className="input"
            placeholder="Bir şey yaz... (örn. portföyü güncelle)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button className="btn" onClick={send}>
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
}

/* 
    Sağ Sütun: AI Yorumları ve Partnerler
 */

function InsightsCard() {
  const [rows] = useLocalStorage("pf_rows", [
    { exchange: "Midas", symbol: "ETH", amount: 0.25, buyPriceTRY: 120000 },
    { exchange: "Binance", symbol: "XLM", amount: 100, buyPriceTRY: 10.5 },
  ]);
  const [prices, setPrices] = useState({});
  useEffect(() => {
    const syms = [...new Set(rows.map((r) => r.symbol.toUpperCase()))];
    (async () => setPrices(await fetchMarkets(syms)))();
  }, [JSON.stringify(rows)]);

  const notes = useMemo(() => {
    const out = [];
    rows.forEach((r) => {
      const p = prices[r.symbol];
      if (!p) return;
      const val = (p.priceTRY || 0) * r.amount;
      const buy = r.buyPriceTRY * r.amount;
      const pnl = val - buy;
      const tag = pnl >= 0 ? "iyi hamle" : "hata";
      const pct24 = p.pct24h;
      out.push({
        tag,
        text:
          `${r.symbol} pozisyonu ${pnl >= 0 ? "kârda" : "zararda"} ` +
          `(${pnl.toLocaleString("tr-TR")} ₺). ` +
          (Number.isFinite(pct24) ? `24s: ${pct24.toFixed(2)}%. ` : "") +
          (pct24 > 5
            ? "Güçlü ivme, kademeli realizasyon düşün."
            : pct24 < -5
            ? "Düşüş ivmesi, zarar durdur gözden geçir."
            : "Nötr seyir."),
      });
    });
    return out.slice(0, 5);
  }, [prices, rows]);

  const [tab, setTab] = useState("gunluk");

  return (
    <div className="card ">
      <div className="hd" style={{ borderBottom: 0 }}>
        <strong>AI Yorumları</strong>
        <div className="tabs small">
          {["gunluk", "aylik", "genel"].map((t) => (
            <button
              key={t}
              className={`tab ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t === "gunluk" ? "Günlük" : t === "aylik" ? "Aylık" : "Genel"}
            </button>
          ))}
        </div>
      </div>
      <div className="bd">
        {notes.length === 0 && <div className="muted">hesaplanıyor…</div>}
        {notes.map((n, i) => (
          <div key={i} className="note">
            <div
              style={{
                display: "inline-block",
                fontSize: 12,
                padding: "2px 8px",
                borderRadius: 8,
                background:
                  n.tag === "iyi hamle"
                    ? "rgba(34,197,94,.15)"
                    : "rgba(244,63,94,.15)",
                color: n.tag === "iyi hamle" ? "#34d399" : "#fb7185",
                marginBottom: 6,
              }}
            >
              {n.tag}
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.4 }}>{n.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PartnersCard() {
  const partners = [
    { name: "Midas", code: "MD", url: "#" },
    { name: "Binance", code: "BN", url: "#" },
    { name: "TradingView", code: "TV", url: "#" },
  ];
  return (
    <div className="card">
      <div className="hd" style={{ borderBottom: 0 }}>
        <strong>Çalıştığım Firmalar</strong>
      </div>
      <div className="bd">
        {partners.map((p, i) => (
          <a
            key={i}
            href={p.url}
            target="_blank"
            rel="noreferrer"
            className="partner"
          >
            <div className="logo">{p.code}</div>
            <div>{p.name}</div>
          </a>
        ))}
      </div>
    </div>
  );
}

/* 
      ANA: App
 */

export default function App() {
  const [tab, setTab] = useState("portfolio");
  // İlk yükte ikincil bileşenleri ertele
  const [showBars, setShowBars] = useState(false);
  const [showNews, setShowNews] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setShowBars(true), 300); // BarChartLive 300ms sonra
    const t2 = setTimeout(() => setShowNews(true), 1200); // NewsCard 1.2s sonra
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <>
      <div className="nav">
        <div className="row">
          <div>
            <button
              className={`btn ${tab === "portfolio" ? "active" : ""}`}
              onClick={() => setTab("portfolio")}
            >
              Yatırımlar
            </button>
            <button
              className={`btn ${tab === "projects" ? "active" : ""}`}
              onClick={() => setTab("projects")}
            >
              Projeler
            </button>
            <button
              className={`btn ${tab === "vlog" ? "active" : ""}`}
              onClick={() => setTab("vlog")}
            >
              Vlog
            </button>
            <button
              className={`btn ${tab === "skills" ? "active" : ""}`}
              onClick={() => setTab("skills")}
            >
              Beceriler
            </button>
          </div>
          <div className="right">
            <a
              href="https://github.com/19saye/Prsch_HQC_project/tree/master"
              target="_blank"
              rel="noreferrer"
              className="btn ghost"
            >
              GitHub
            </a>

            <a href="#" className="btn ghost">
              YouTube
            </a>
            <a href="#" className="btn ghost">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
      <button
        className="btn ghost"
        onClick={() => {
          // projeyle ilgili tüm yerel anahtarları temizle
          [
            "pf_projects",
            "pf_vlogs",
            "pf_rows",
            "pf_skills",
            "pf_ai_msgs",
          ].forEach((k) => localStorage.removeItem(k));
          location.reload();
        }}
        title="Yerel verileri (projeler, vlog, portföy, beceriler, sohbet) sıfırlar"
      >
        Yereli Sıfırla
      </button>

      {tab === "portfolio" ? (
        // ✔ YATIRIMLAR: sol ticker YOK
        <div className="container grid-3">
          <aside className="col-left">
            <div className="card">
              <InsightsCard />
            </div>
          </aside>

          <main>
            <header style={{ margin: "28px 0 16px" }}>
              <h1> </h1>
              <div className="muted">
                AI & PQC enthusiast — below is my portfolio, projects, vlog and
                skills. Digital Twin guides at the bottom right.
              </div>
            </header>

            {showBars && <BarChartLive />}

            <Portfolio />
          </main>

          <aside className="col-right">
            {showNews && <NewsCard />}

            <PartnersCard />
          </aside>
        </div>
      ) : (
        // DİĞER SEKMELER: sol ticker VAR
        <div className="container">
          <header style={{ margin: "28px 0 16px" }}>
            <h1> HOLA! Rabiya..</h1>
            <div className="muted">
              AI & PQC enthusiast — below is my portfolio, projects, vlog and
              skills. Digital Twin guides at the bottom right.
            </div>
          </header>

          {tab === "projects" && <Projects />}
          {tab === "vlog" && <Vlog />}
          {tab === "skills" && <Skills />}

          <CoinTickerLeft />
        </div>
      )}

      <AITwin onNavigate={setTab} />
    </>
  );
}

//   cd ~/Desktop/PORTFOY_VITRIN/portfoy
//   npm run dev
