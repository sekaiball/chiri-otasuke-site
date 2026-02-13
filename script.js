// =============================
// 地理系お助けサイト ULTIMATE
// =============================

let map = null;
let currentMarker = null;
let allCountries = [];

// -----------------------------
// 日本語正規化
// -----------------------------
function normalizeText(text) {
  return text.toLowerCase().replace(/[ぁ-ん]/g, s =>
    String.fromCharCode(s.charCodeAt(0) + 0x60)
  );
}

// -----------------------------
// API事前取得（高速化）
// -----------------------------
async function loadCountries() {
  const res = await fetch("https://restcountries.com/v3.1/all");
  allCountries = await res.json();
}
loadCountries();

// -----------------------------
// 地図表示
// -----------------------------
function showMap() {
  document.getElementById("searchDiv").style.display = "none";
  removeMap();

  document.getElementById("result").innerHTML =
    "<div id='map'></div>";

  map = L.map("map").setView([20, 0], 2);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

  map.on("click", function(e) {
    showCoordinates(e.latlng.lat, e.latlng.lng);
  });
}

// -----------------------------
function removeMap() {
  if (map) {
    map.remove();
    map = null;
  }
  currentMarker = null;
}

// -----------------------------
// 座標表示
// -----------------------------
function showCoordinates(lat, lng) {
  document.getElementById("infoBar").innerText =
    `緯度: ${lat.toFixed(4)} / 経度: ${lng.toFixed(4)}`;
}

// -----------------------------
// 現在地取得
// -----------------------------
function getLocation() {
  if (!navigator.geolocation) {
    alert("位置情報未対応");
    return;
  }

  navigator.geolocation.getCurrentPosition(pos => {
    showMap();
    map.setView([pos.coords.latitude, pos.coords.longitude], 6);

    currentMarker = L.marker([
      pos.coords.latitude,
      pos.coords.longitude
    ]).addTo(map)
      .bindPopup("現在地")
      .openPopup();
  });
}

// -----------------------------
// ランダム国（独立国限定）
// -----------------------------
function randomCountry() {
  removeMap();
  const independent = allCountries.filter(c => c.independent);
  const country = independent[Math.floor(Math.random() * independent.length)];
  displayCountry(country);
}

// -----------------------------
// 日本47都道府県
// -----------------------------
const japanPrefectures = [
  "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県",
  "岐阜県","静岡県","愛知県","三重県",
  "滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県",
  "鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県",
  "福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県"
];

function randomPrefecture() {
  removeMap();
  const random = japanPrefectures[Math.floor(Math.random()*47)];
  document.getElementById("result").innerHTML = `<h2>${random}</h2>`;
}

// -----------------------------
// 国検索
// -----------------------------
function showSearch() {
  removeMap();
  document.getElementById("searchDiv").style.display = "block";
  document.getElementById("result").innerHTML = "";
}

function searchCountry() {
  const input = normalizeText(document.getElementById("searchInput").value);

  let found = allCountries.find(c => {
    const jp = normalizeText(c.translations?.jpn?.common || "");
    const en = normalizeText(c.name?.common || "");
    return c.independent && (jp === input || en === input);
  });

  if (!found) {
    found = allCountries.find(c => {
      const jp = normalizeText(c.translations?.jpn?.common || "");
      const en = normalizeText(c.name?.common || "");
      return jp.includes(input) || en.includes(input);
    });
  }

  if (found) {
    displayCountry(found);
    zoomToCountry(found);
  } else {
    document.getElementById("result").innerHTML =
      "<p>国が見つかりませんでした</p>";
  }
}

// -----------------------------
// 国表示
// -----------------------------
function displayCountry(country) {
  removeMap();

  const nameJP = country.translations?.jpn?.common || country.name.common;
  const flag = country.flags?.svg;

  document.getElementById("result").innerHTML = `
    <div class="country-card">
      <img src="${flag}">
      <h2>${nameJP}</h2>
      <p>人口: ${country.population.toLocaleString()}</p>
      <p>面積: ${country.area.toLocaleString()} km²</p>
      <p>首都: ${country.capital}</p>
    </div>
  `;
}

// -----------------------------
// 国へ自動ズーム
// -----------------------------
function zoomToCountry(country) {
  showMap();

  const latlng = country.latlng;
  if (!latlng) return;

  map.setView(latlng, 5);

  currentMarker = L.marker(latlng)
    .addTo(map)
    .bindPopup(country.translations?.jpn?.common || country.name.common)
    .openPopup();
}
