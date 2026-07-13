// Lemonade to Legacy — business tycoon game logic
"use strict";

const TIERS = [
  {
    name: "Lemonade Stand",
    emoji: "🍋",
    product: "cups of lemonade",
    unitCost: 0.35,
    idealPrice: 1.25,
    baseDemand: 45,
    fixedCost: 5,
    baseCapacity: 50,
    employeeCapacityBonus: 15,
    employeeWage: 15,
    maxEmployees: 3,
    perishable: 0.4,
    weatherSensitive: true,
    upgradeCost: 800,
  },
  {
    name: "Food Truck",
    emoji: "🚚",
    product: "tacos",
    unitCost: 2.2,
    idealPrice: 6,
    baseDemand: 80,
    fixedCost: 60,
    baseCapacity: 90,
    employeeCapacityBonus: 35,
    employeeWage: 70,
    maxEmployees: 5,
    perishable: 0.25,
    weatherSensitive: true,
    upgradeCost: 7000,
  },
  {
    name: "Café",
    emoji: "☕",
    product: "coffees & pastries",
    unitCost: 1.6,
    idealPrice: 5,
    baseDemand: 170,
    fixedCost: 250,
    baseCapacity: 190,
    employeeCapacityBonus: 60,
    employeeWage: 95,
    maxEmployees: 10,
    perishable: 0.15,
    weatherSensitive: false,
    upgradeCost: 55000,
  },
  {
    name: "Restaurant",
    emoji: "🍽️",
    product: "dinner meals",
    unitCost: 9,
    idealPrice: 28,
    baseDemand: 230,
    fixedCost: 900,
    baseCapacity: 260,
    employeeCapacityBonus: 90,
    employeeWage: 150,
    maxEmployees: 18,
    perishable: 0.1,
    weatherSensitive: false,
    upgradeCost: 380000,
  },
  {
    name: "Retail Chain",
    emoji: "🏬",
    product: "store items",
    unitCost: 6,
    idealPrice: 22,
    baseDemand: 950,
    fixedCost: 4000,
    baseCapacity: 1000,
    employeeCapacityBonus: 150,
    employeeWage: 180,
    maxEmployees: 45,
    perishable: 0,
    weatherSensitive: false,
    upgradeCost: 3500000,
  },
  {
    name: "Global Corporation",
    emoji: "🏙️",
    product: "contracts closed",
    unitCost: 4200,
    idealPrice: 12000,
    baseDemand: 55,
    fixedCost: 40000,
    baseCapacity: 60,
    employeeCapacityBonus: 3,
    employeeWage: 900,
    maxEmployees: 120,
    perishable: 0,
    weatherSensitive: false,
    upgradeCost: Infinity, // final tier
  },
];

const EVENTS = [
  { weight: 3, weatherOnly: true, name: "Sunny skies", factor: 1.3, rep: 0, kind: "weather" },
  { weight: 3, weatherOnly: true, name: "Rainy day", factor: 0.55, rep: 0, kind: "weather" },
  { weight: 4, weatherOnly: true, name: "Normal weather", factor: 1.0, rep: 0, kind: "weather" },
  { weight: 2, name: "A local blogger raved about you!", factor: 1.6, rep: 5, kind: "good" },
  { weight: 2, name: "Your post went viral online!", factor: 2.0, rep: 3, kind: "good" },
  { weight: 2, name: "A competitor opened nearby.", factor: 0.65, rep: -1, kind: "bad" },
  { weight: 1, name: "Health inspector fine.", factor: 1.0, rep: -3, cashHitMultiplier: 10, kind: "bad" },
  { weight: 1, name: "Equipment breakdown — repairs needed.", factor: 0.8, rep: 0, cashHitMultiplier: 8, kind: "bad" },
  { weight: 2, name: "Quiet day — nothing unusual.", factor: 1.0, rep: 0, kind: "neutral" },
];

const SAVE_KEY = "lemonadeToLegacySave";

let state = null;

function defaultState() {
  return {
    tier: 0,
    day: 1,
    cash: 50,
    reputation: 50,
    inventory: 0,
    employees: 0,
    marketing: 0,
    price: TIERS[0].idealPrice,
    history: [], // cash over time
    log: [], // recent day summaries
  };
}

function load() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (raw) {
    try {
      state = JSON.parse(raw);
      return;
    } catch (e) {
      /* fall through to fresh state */
    }
  }
  state = defaultState();
}

function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function currentTier() {
  return TIERS[state.tier];
}

function fmtMoney(n) {
  const sign = n < 0 ? "-" : "";
  n = Math.abs(n);
  if (n >= 1_000_000) return sign + "$" + (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1000) return sign + "$" + (n / 1000).toFixed(1) + "k";
  return sign + "$" + n.toFixed(2);
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function weightedPick(list) {
  const total = list.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const e of list) {
    if (r < e.weight) return e;
    r -= e.weight;
  }
  return list[list.length - 1];
}

function pickEvent(tier) {
  const weatherPool = EVENTS.filter((e) => e.weatherOnly);
  const otherPool = EVENTS.filter((e) => !e.weatherOnly);

  let weather = null;
  if (tier.weatherSensitive) {
    weather = weightedPick(weatherPool);
  }

  // 55% chance of an additional "other" event on top of weather
  let other = null;
  if (Math.random() < 0.55) {
    other = weightedPick(otherPool);
  }

  return { weather, other };
}

function runDay() {
  const tier = currentTier();
  const { weather, other } = pickEvent(tier);

  const ratio = state.price / tier.idealPrice;
  const priceFactor = clamp(2 - ratio, 0.1, 1.5);
  const repFactor = 0.5 + state.reputation / 100;
  const marketingFactor = 1 + Math.min(state.marketing / (tier.idealPrice * 50), 0.8);
  const weatherFactor = weather ? weather.factor : 1;
  const otherFactor = other ? other.factor : 1;

  const demand = tier.baseDemand * priceFactor * repFactor * marketingFactor * weatherFactor * otherFactor;
  const capacity = tier.baseCapacity + state.employees * tier.employeeCapacityBonus;
  const unitsSold = Math.max(0, Math.floor(Math.min(demand, state.inventory, capacity)));

  // Note: inventory is already paid for at purchase time (buyInventory), so
  // cost of goods sold is not charged again here.
  const revenue = unitsSold * state.price;
  const wages = state.employees * tier.employeeWage;
  const eventCashHit = other && other.cashHitMultiplier ? tier.fixedCost * other.cashHitMultiplier : 0;
  const totalCosts = wages + tier.fixedCost + state.marketing + eventCashHit;
  const profit = revenue - totalCosts;

  state.cash += profit;

  // leftover inventory & spoilage
  let leftover = state.inventory - unitsSold;
  if (tier.perishable > 0) {
    leftover = Math.floor(leftover * (1 - tier.perishable));
  }
  state.inventory = leftover;

  // reputation shifts
  let repDelta = 0;
  const unmetDemand = demand - unitsSold;
  if (unmetDemand > demand * 0.25) repDelta -= 1; // turned away a lot of customers (low stock or low capacity)
  if (ratio > 1.3) repDelta -= 1; // overpriced
  if (ratio < 0.9 && unitsSold > 0) repDelta += 1; // good value
  if (capacity > 0 && unitsSold >= capacity * 0.9) repDelta += 1; // ran a busy, well-staffed day
  if (weather && weather.rep) repDelta += weather.rep;
  if (other && other.rep) repDelta += other.rep;
  // mild pull back toward a neutral 50 so a rough patch isn't a permanent death spiral
  repDelta += (50 - state.reputation) * 0.03;
  state.reputation = clamp(state.reputation + repDelta, 0, 100);

  const messages = [];
  if (weather && weather.kind !== "neutral" && tier.weatherSensitive) messages.push(weather.name);
  if (other) messages.push(other.name);

  const entry = {
    day: state.day,
    unitsSold,
    revenue,
    totalCosts,
    profit,
    cash: state.cash,
    messages,
  };
  state.log.unshift(entry);
  state.log = state.log.slice(0, 40);
  state.history.push(state.cash);
  state.history = state.history.slice(-60);

  state.day += 1;
  save();
  render();
}

function buyInventory(requestedQty) {
  const tier = currentTier();
  requestedQty = Math.max(0, Math.floor(requestedQty));
  if (requestedQty <= 0) return;

  const affordableQty = Math.min(requestedQty, Math.floor(state.cash / tier.unitCost));
  if (affordableQty <= 0) {
    alert("Not enough cash to buy any inventory.");
    return;
  }
  if (affordableQty < requestedQty) {
    alert(`You could only afford ${affordableQty} units — bought that many instead.`);
  }
  state.cash -= affordableQty * tier.unitCost;
  state.inventory += affordableQty;
  save();
  render();
}

function hire() {
  const tier = currentTier();
  if (state.employees >= tier.maxEmployees) {
    alert(`Max staff for ${tier.name} is ${tier.maxEmployees}.`);
    return;
  }
  const onboardCost = tier.employeeWage;
  if (onboardCost > state.cash) {
    alert("Not enough cash to hire.");
    return;
  }
  state.cash -= onboardCost;
  state.employees += 1;
  save();
  render();
}

function fire() {
  if (state.employees <= 0) return;
  state.employees -= 1;
  save();
  render();
}

// Require a cash cushion above the sticker price so a player isn't left
// with no working capital to restock right after upgrading.
const UPGRADE_CASH_BUFFER = 1.25;

function canUpgrade() {
  const tier = currentTier();
  return state.tier < TIERS.length - 1 && state.cash >= tier.upgradeCost * UPGRADE_CASH_BUFFER;
}

function upgrade() {
  const tier = currentTier();
  if (!canUpgrade()) return;
  state.cash -= tier.upgradeCost;
  state.tier += 1;
  state.inventory = 0;
  state.employees = Math.min(state.employees, TIERS[state.tier].maxEmployees);
  state.marketing = 0;
  state.price = TIERS[state.tier].idealPrice;
  state.reputation = clamp(state.reputation - 5, 0, 100); // fresh venture jitters
  save();
  render();
}

function resetGame() {
  if (!confirm("Start a new game? Your current progress will be lost.")) return;
  state = defaultState();
  save();
  render();
}

// ---------- Rendering ----------

function drawChart() {
  const canvas = document.getElementById("cashChart");
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.clientWidth || canvas.width;
  const cssH = canvas.clientHeight || canvas.height;
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const w = cssW;
  const h = cssH;
  const padL = 6, padR = 6, padT = 10, padB = 10;
  ctx.clearRect(0, 0, w, h);

  const styles = getComputedStyle(document.documentElement);
  const ruleColor = styles.getPropertyValue("--rule").trim();
  const profitColor = styles.getPropertyValue("--profit").trim();
  const lossColor = styles.getPropertyValue("--loss").trim();

  const data = state.history.length >= 2 ? state.history : [state.cash, state.cash];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const lineColor = data[data.length - 1] >= data[0] ? profitColor : lossColor;

  const xAt = (i) => padL + (i / (data.length - 1)) * (w - padL - padR);
  const yAt = (v) => h - padB - ((v - min) / range) * (h - padT - padB);

  // faint horizontal grid
  ctx.strokeStyle = ruleColor;
  ctx.lineWidth = 1;
  for (let g = 0; g <= 2; g++) {
    const y = padT + (g / 2) * (h - padT - padB);
    ctx.beginPath();
    ctx.moveTo(padL, Math.round(y) + 0.5);
    ctx.lineTo(w - padR, Math.round(y) + 0.5);
    ctx.stroke();
  }

  // area fill under the line
  ctx.beginPath();
  ctx.moveTo(xAt(0), yAt(data[0]));
  data.forEach((v, i) => ctx.lineTo(xAt(i), yAt(v)));
  ctx.lineTo(xAt(data.length - 1), h - padB);
  ctx.lineTo(xAt(0), h - padB);
  ctx.closePath();
  ctx.fillStyle = lineColor + "22";
  ctx.fill();

  // line
  ctx.beginPath();
  data.forEach((v, i) => {
    const x = xAt(i);
    const y = yAt(v);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.stroke();

  // emphasized endpoint
  const lastX = xAt(data.length - 1);
  const lastY = yAt(data[data.length - 1]);
  ctx.beginPath();
  ctx.arc(lastX, lastY, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = lineColor;
  ctx.fill();
}

function render() {
  const tier = currentTier();

  document.getElementById("tierEmoji").textContent = tier.emoji;
  document.getElementById("tierName").textContent = tier.name;
  document.getElementById("tierProduct").textContent = `Selling ${tier.product}`;

  document.getElementById("dayValue").textContent = state.day;
  document.getElementById("cashValue").textContent = fmtMoney(state.cash);
  document.getElementById("repValue").textContent = Math.round(state.reputation) + "%";

  document.getElementById("priceInput").value = state.price;
  document.getElementById("idealPriceHint").textContent = `(typical: $${tier.idealPrice})`;
  document.getElementById("unitCostHint").textContent = `($${tier.unitCost.toFixed(2)} each)`;
  document.getElementById("inventoryValue").textContent = state.inventory;
  document.getElementById("marketingInput").value = state.marketing;
  document.getElementById("employeeCount").textContent = state.employees;
  document.getElementById("wageHint").textContent = `($${tier.employeeWage}/day each, max ${tier.maxEmployees})`;

  const capacity = tier.baseCapacity + state.employees * tier.employeeCapacityBonus;
  document.getElementById("snapshotList").innerHTML = `
    <li><span>Daily capacity</span><span>${capacity} units</span></li>
    <li><span>Fixed costs/day</span><span>${fmtMoney(tier.fixedCost)}</span></li>
    <li><span>Unit cost</span><span>${fmtMoney(tier.unitCost)}</span></li>
    <li><span>Ideal price</span><span>${fmtMoney(tier.idealPrice)}</span></li>
  `;

  const banner = document.getElementById("upgradeBanner");
  if (state.tier < TIERS.length - 1) {
    const next = TIERS[state.tier + 1];
    if (canUpgrade()) {
      banner.classList.remove("hidden");
      document.getElementById("upgradeText").textContent =
        `You can afford to expand into a ${next.name} ${next.emoji} for ${fmtMoney(tier.upgradeCost)}!`;
      document.getElementById("upgradeBtn").disabled = false;
    } else {
      banner.classList.add("hidden");
    }
  } else {
    banner.classList.add("hidden");
  }

  const log = document.getElementById("log");
  log.innerHTML = state.log
    .map((e) => {
      const cls = e.profit >= 0 ? "profit" : "loss";
      const msg = e.messages.length ? `<div class="event">${e.messages.join(" · ")}</div>` : "";
      return `<div class="log-entry ${cls}">
        <div class="log-head"><span>Day ${e.day}</span><span>${e.profit >= 0 ? "+" : ""}${fmtMoney(e.profit)}</span></div>
        <div class="details">Sold ${e.unitsSold} units · Revenue ${fmtMoney(e.revenue)} · Operating costs ${fmtMoney(e.totalCosts)}</div>
        ${msg}
      </div>`;
    })
    .join("");

  drawChart();
}

// ---------- Wiring ----------

function init() {
  load();

  document.getElementById("priceInput").addEventListener("change", (e) => {
    state.price = Math.max(0, parseFloat(e.target.value) || 0);
    save();
  });

  document.getElementById("marketingInput").addEventListener("change", (e) => {
    state.marketing = Math.max(0, parseFloat(e.target.value) || 0);
    save();
  });

  document.getElementById("buyBtn").addEventListener("click", () => {
    const qty = parseInt(document.getElementById("buyQtyInput").value, 10) || 0;
    buyInventory(qty);
  });

  document.getElementById("hireBtn").addEventListener("click", hire);
  document.getElementById("fireBtn").addEventListener("click", fire);
  document.getElementById("runDayBtn").addEventListener("click", runDay);
  document.getElementById("upgradeBtn").addEventListener("click", upgrade);
  document.getElementById("resetBtn").addEventListener("click", resetGame);

  render();
}

document.addEventListener("DOMContentLoaded", init);
