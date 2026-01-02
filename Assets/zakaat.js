//npx tailwindcss -i ./zakaaty.css -o ./output.css --watch
const mobileNav =document.getElementById("mobileNav")
document.getElementById("menuIcon").addEventListener("click", ()=>{
  mobileNav.classList.remove("translate-x-full")
})

document.getElementById("closeIcon").addEventListener("click", ()=>{
  mobileNav.classList.add("translate-x-full")
});


//Scroll zoom 

const nav = document.getElementById("navbar");
const logoBg = document.getElementById("logoBg")

window.addEventListener("scroll", () => {
  const scrolled = window.scrollY > 50;

  nav.classList.toggle("bg-white", scrolled);
  nav.classList.toggle("text-[var(--Twilight)]", scrolled);
  nav.classList.toggle("text-white", !scrolled);
  
});

//Select preferred School of Thought
const zakaatPage = document.querySelectorAll(".zakaatPage");
const madhab = document.getElementById("selectMadh");

function updateMadhhab() {
  const schOfThought = madhab.value;

  zakaatPage.forEach(page => {
    const getPage = page.getAttribute("data-page")
    page.classList.toggle(
      "hidden",
      getPage !== schOfThought
    );
  });
}

madhab?.addEventListener("change", updateMadhhab);

if (madhab && zakaatPage.length) {
  updateMadhhab();
}





document.addEventListener("DOMContentLoaded", () => {
  // Gregorian
  const dateEl = document.getElementById("date");
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }

  // Hijri
  const hijriEl = document.getElementById("hijriDate");
  if (hijriEl) {
    try {
      hijriEl.textContent = new Intl.DateTimeFormat(
        "en-SA-u-ca-islamic-umalqura",
        { day: "numeric", month: "long", year: "numeric" }
      ).format(new Date());
    } catch {
      hijriEl.textContent = "";
    }
  }

//Usd => Ngn
const CACHE_KEY = "usd_ngn_rate";
const CACHE_TIME_KEY = "usd_ngn_rate_time";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

async function getUsdToNgn() {
  const UsdToNgn = document.getElementById("UsdNgn");
  if (!UsdToNgn) return;

  const cachedRate = localStorage.getItem(CACHE_KEY);
  const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

  //Use cache if still valid
  if (cachedRate && cachedTime && Date.now() - cachedTime < CACHE_TTL) {
    UsdToNgn.textContent = `₦${Math.round(cachedRate).toLocaleString()}`;
    return;
  }

  // Fetch fresh rate
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD");
    if (!res.ok) throw new Error("Fetch failed");

    const data = await res.json();
    const rate = data.rates?.NGN;
    if (!rate) throw new Error("NGN rate missing");

    // Save to cache
    localStorage.setItem(CACHE_KEY, rate);
    localStorage.setItem(CACHE_TIME_KEY, Date.now());

    UsdToNgn.textContent = `₦${Math.round(rate).toLocaleString()}`;
  } catch (err) {
    console.error(err);

    // API failed → fallback to old cache if exists
    if (cachedRate) {
      UsdToNgn.textContent = ` ₦${Math.round(cachedRate).toLocaleString()}`;
    } else {
      UsdToNgn.textContent = "Rate unavailable";
    }
  }
}
getUsdToNgn()
})

//Handling the calculations

// Select all inputs
const assetInput = document.querySelectorAll(".assetInput");
const liabilityInput = document.querySelectorAll(".liabilityInput");
const netValue = document.querySelectorAll(".netValue");

// Update only visible netValue

document.addEventListener("DOMContentLoaded", () => {
function updateNetValue(value) {
  netValue.forEach(el => {
    if (!el.classList.contains("hidden")) {
      el.textContent = value.toLocaleString();

    }
  });
}

// Calculate total assets minus liabilities
function calculateNetValue() {
  let assetTotal = 0;
  let liabilityTotal = 0;

  assetInput.forEach(asset=> assetTotal += Number(asset.value) || 0);
  liabilityInput.forEach(liability=> liabilityTotal += Number(liability.value) || 0);

  updateNetValue(assetTotal - liabilityTotal);
}

// Auto-update as user types
document.querySelectorAll(".assetInput, .liabilityInput")
  .forEach(input => input.addEventListener("input", calculateNetValue));

})



document.addEventListener("DOMContentLoaded", async () => {
  const goldElem = document.getElementById("goldNisab");
  const silverElem = document.getElementById("silverNisab");
  const madhhabSelect = document.getElementById("selectMadh"); // your select element

  // Show loading state initially
  goldElem.textContent = "Loading…";
  silverElem.textContent = "Loading…";

  let nisabData = { goldNisab: 0, silverNisab: 0 };

  try {
    const res = await fetch(
      "https://us-central1-zakaatify-data-backend.cloudfunctions.net/getNisab"
    );

    if (!res.ok) throw new Error("Failed to fetch Nisab from backend");

    nisabData = await res.json();
  } catch (err) {
    console.error("Error fetching Nisab:", err);
    goldElem.textContent = "Nisab unavailable";
    silverElem.textContent = "Nisab unavailable";
    return;
  }

  // Function to update display based on selected madhhab
  function updateNisabDisplay() {
    const selectedMadhhab = madhhabSelect.value;

    if (selectedMadhhab === "Hanafi") {
      silverElem.textContent = `₦${nisabData.silverNisab.toLocaleString()}`;
      goldElem.textContent = ""; // hide gold
    } else {
      goldElem.textContent = `₦${nisabData.goldNisab.toLocaleString()}`;
      silverElem.textContent = ""; // hide silver
    }
  }

  // Initial display
  updateNisabDisplay();

  // Listen for changes
  madhhabSelect.addEventListener("change", updateNisabDisplay);
});
