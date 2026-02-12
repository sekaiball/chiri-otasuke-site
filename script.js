let map;
const content = document.getElementById("content");

// ===============================
// 地理系お助けサイト 完全強化版
// 国旗付き・日本語検索対応
// ===============================

// ===== 文字正規化（日本語対応） =====
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[ぁ-ん]/g, s =>
      String.fromCharCode(s.charCodeAt(0) + 0x60)
    );
}

// ===============================
// 日本47都道府県
// ===============================

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

// ===============================
// ランダム都道府県
// ===============================

function randomPrefecture() {
  const random = japanPrefectures[
    Math.floor(Math.random() * japanPrefectures.length)
  ];

  document.getElementById("result").innerHTML = `
    <h2>${random}</h2>
  `;
}

// ===============================
// ランダム国（全世界）
// ===============================

async function randomCountry() {
  const res = await fetch("https://restcountries.com/v3.1/all");
  const data = await res.json();
  const country = data[Math.floor(Math.random() * data.length)];

  displayCountry(country);
}

// ===============================
// 国表示（国旗付き）
// ===============================

function displayCountry(country) {
  const nameJP = country.translations?.jpn?.common || country.name.common;
  const official = country.name.official;
  const area = country.area ? country.area.toLocaleString() : "不明";
  const population = country.population ? country.population.toLocaleString() : "不明";
  const currency = Object.values(country.currencies || {})[0]?.name || "不明";
  const flag = country.flags?.svg || country.flags?.png;

  document.getElementById("result").innerHTML = `
    <div class="country-card">
      <img src="${flag}" alt="flag" style="width:150px; border:1px solid #ccc; margin-bottom:10px;">
      <h2>${nameJP}</h2>
      <p><strong>正式名:</strong> ${official}</p>
      <p><strong>面積:</strong> ${area} km²</p>
      <p><strong>人口:</strong> ${population}</p>
      <p><strong>通貨:</strong> ${currency}</p>
    </div>
  `;
}

// ===============================
// 国検索（日本語完全対応）
// ===============================

async function searchCountry() {
  const input = document.getElementById("searchInput").value;
  const normalized = normalizeText(input);

  const res = await fetch("https://restcountries.com/v3.1/all");
  const data = await res.json();

  const found = data.find(c => {
    const jp = normalizeText(c.translations?.jpn?.common || "");
    const en = normalizeText(c.name.common);
    return jp.includes(normalized) || en.includes(normalized);
  });

  if (found) {
    displayCountry(found);
  } else {
    document.getElementById("result").innerHTML =
      "<p>国が見つかりませんでした。</p>";
  }
}

// ===============================
// 世界の州取得
// ===============================

async function searchState() {
  const countryName = document.getElementById("searchInput").value;

  const res = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ country: countryName })
  });

  const data = await res.json();

  if (data.data && data.data.states.length > 0) {
    const statesList = data.data.states
      .map(s => `<li>${s.name}</li>`)
      .join("");

    document.getElementById("result").innerHTML = `
      <h2>${countryName} の州一覧</h2>
      <ul>${statesList}</ul>
    `;
  } else {
    document.getElementById("result").innerHTML =
      "<p>州データが見つかりませんでした。</p>";
  }
}
