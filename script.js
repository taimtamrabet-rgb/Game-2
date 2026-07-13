// Lemonade to Legacy — life & business sim
"use strict";

// ---------- Constants ----------

const DEGREES = {
  law: { label: "Law", difficulty: "Easy", track: "law", skill: "networking",
    blurb: "Stable pay, a straightforward ladder. Paralegal to partner." },
  nursing: { label: "Nursing", difficulty: "Easy", track: "nursing", skill: "clinical",
    blurb: "In-demand and steady. CNA to nurse practitioner." },
  finance: { label: "Finance", difficulty: "Medium", track: "finance", skill: "management",
    blurb: "Decent pay, steady promotions if you put in the years." },
  marketing: { label: "Marketing", difficulty: "Medium", track: "marketing", skill: "branding",
    blurb: "Creative and business-minded, with real room to climb." },
  art: { label: "Art", difficulty: "Hard", track: "art", skill: "craft",
    blurb: "Low, unstable pay early on — but the ceiling is high if you make it." },
  music: { label: "Music", difficulty: "Hard", track: "music", skill: "performance",
    blurb: "Gigs barely pay at first — but a breakout act pays big." },
};

const JOB_TRACKS = {
  law: [
    { title: "Paralegal", weeklyPay: 700, weeksReq: 0, skillReq: 0 },
    { title: "Associate Attorney", weeklyPay: 1400, weeksReq: 26, skillReq: 30 },
    { title: "Law Firm Partner", weeklyPay: 3000, weeksReq: 52, skillReq: 65 },
  ],
  nursing: [
    { title: "Certified Nursing Assistant", weeklyPay: 650, weeksReq: 0, skillReq: 0 },
    { title: "Registered Nurse", weeklyPay: 1300, weeksReq: 24, skillReq: 28 },
    { title: "Nurse Practitioner", weeklyPay: 2600, weeksReq: 48, skillReq: 60 },
  ],
  finance: [
    { title: "Bank Teller", weeklyPay: 500, weeksReq: 0, skillReq: 0 },
    { title: "Financial Analyst", weeklyPay: 900, weeksReq: 28, skillReq: 35 },
    { title: "Portfolio Manager", weeklyPay: 2200, weeksReq: 56, skillReq: 70 },
  ],
  marketing: [
    { title: "Marketing Assistant", weeklyPay: 480, weeksReq: 0, skillReq: 0 },
    { title: "Marketing Manager", weeklyPay: 950, weeksReq: 30, skillReq: 38 },
    { title: "Marketing Director", weeklyPay: 2100, weeksReq: 58, skillReq: 72 },
  ],
  art: [
    { title: "Freelance Gigs", weeklyPay: 320, weeksReq: 0, skillReq: 0, variance: 0.45 },
    { title: "Studio Artist", weeklyPay: 650, weeksReq: 32, skillReq: 40, variance: 0.2 },
    { title: "Gallery-Represented Artist", weeklyPay: 1900, weeksReq: 60, skillReq: 75, variance: 0.15 },
  ],
  music: [
    { title: "Gigging Musician", weeklyPay: 300, weeksReq: 0, skillReq: 0, variance: 0.5 },
    { title: "Session Musician", weeklyPay: 620, weeksReq: 34, skillReq: 42, variance: 0.22 },
    { title: "Touring Artist", weeklyPay: 2000, weeksReq: 62, skillReq: 78, variance: 0.12 },
  ],
};

const TAX_RATE_JOB = 0.18;
const TAX_RATE_BUSINESS = 0.15;
const SAVINGS_APR = 0.03;

const HOUSING = [
  { name: "Shared Room", rent: 120 },
  { name: "Studio Apartment", rent: 250 },
  { name: "One-Bedroom Apartment", rent: 400 },
  { name: "House", rent: 700 },
];
const MOVE_FEE = 150;
const LIVING_GROCERIES = 90;
const LIVING_BILLS = 45;

const RANDOM_LIFE_EVENTS = [
  { weight: 3, name: "Parking Ticket", amount: 50 },
  { weight: 2, name: "Minor Car Repair", amount: 180 },
  { weight: 2, name: "Medical Copay", amount: 75 },
  { weight: 1, name: "Cracked Phone Screen", amount: 120 },
  { weight: 1, name: "Speeding Ticket", amount: 110 },
  { weight: 1, name: "Found Cash on the Sidewalk", amount: -40 },
];
const WEEKLY_EVENT_CHANCE = 0.22;

const BUSINESS_TIERS = [
  { name: "Lemonade Stand", emoji: "🍋", product: "cups of lemonade",
    unitCost: 0.35, idealPrice: 1.5, baseDemand: 315, fixedCost: 35, baseCapacity: 350,
    employeeCapacityBonus: 105, employeeWage: 105, maxEmployees: 3, perishable: 0.4,
    weatherSensitive: true, startCost: 250 },
  { name: "Food Truck", emoji: "🚚", product: "tacos",
    unitCost: 2.2, idealPrice: 6.5, baseDemand: 560, fixedCost: 420, baseCapacity: 630,
    employeeCapacityBonus: 245, employeeWage: 490, maxEmployees: 5, perishable: 0.25,
    weatherSensitive: true, startCost: 6000 },
  { name: "Café", emoji: "☕", product: "coffees & pastries",
    unitCost: 1.6, idealPrice: 5.5, baseDemand: 1190, fixedCost: 1750, baseCapacity: 1330,
    employeeCapacityBonus: 420, employeeWage: 665, maxEmployees: 10, perishable: 0.15,
    weatherSensitive: false, startCost: 45000 },
  { name: "Restaurant", emoji: "🍽️", product: "dinner meals",
    unitCost: 9, idealPrice: 30, baseDemand: 1610, fixedCost: 6300, baseCapacity: 1820,
    employeeCapacityBonus: 630, employeeWage: 1050, maxEmployees: 18, perishable: 0.1,
    weatherSensitive: false, startCost: 300000 },
  { name: "Retail Chain", emoji: "🏬", product: "store items",
    unitCost: 6, idealPrice: 24, baseDemand: 6650, fixedCost: 28000, baseCapacity: 7000,
    employeeCapacityBonus: 1050, employeeWage: 1260, maxEmployees: 45, perishable: 0,
    weatherSensitive: false, startCost: 2500000 },
  { name: "Global Corporation", emoji: "🏙️", product: "contracts closed",
    unitCost: 4200, idealPrice: 13000, baseDemand: 385, fixedCost: 280000, baseCapacity: 420,
    employeeCapacityBonus: 21, employeeWage: 6300, maxEmployees: 120, perishable: 0,
    weatherSensitive: false, startCost: Infinity },
];

const BUSINESS_EVENTS = [
  { weight: 3, weatherOnly: true, name: "Sunny weather all week", factor: 1.3, rep: 0 },
  { weight: 3, weatherOnly: true, name: "Rainy weather this week", factor: 0.55, rep: 0 },
  { weight: 4, weatherOnly: true, name: "Normal weather", factor: 1.0, rep: 0, silent: true },
  { weight: 2, name: "A local blogger raved about you!", factor: 1.6, rep: 5 },
  { weight: 2, name: "Your post went viral online!", factor: 2.0, rep: 3 },
  { weight: 2, name: "A competitor opened nearby.", factor: 0.65, rep: -1 },
  { weight: 1, name: "Health inspector fine.", factor: 1.0, rep: -3, cashHitMultiplier: 10 },
  { weight: 1, name: "Equipment breakdown — repairs needed.", factor: 0.8, rep: 0, cashHitMultiplier: 8 },
  { weight: 2, name: "Quiet week — nothing unusual.", factor: 1.0, rep: 0, silent: true },
];

const SAVE_KEY = "lemonadeToLegacySaveV3";

let state = null;

// ---------- State ----------

function defaultState() {
  return {
    degree: null,
    activeTab: "home",
    week: 1,
    cash: 500,
    savings: 0,
    studentLoan: { balance: 50000, apr: 0.055, minPayment: 520 },
    businessLoan: null,
    creditScore: 650,
    job: null, // { levelIndex, weeksAtLevel }
    business: null, // { tier, inventory, price, marketing, employees, reputation }
    skills: { networking: 0, management: 0, craft: 0, clinical: 0, branding: 0, performance: 0 },
    housingTier: 0,
    weeksSinceLoanPayment: 0,
    log: [],
    history: [],
  };
}

function load() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (raw) {
    try {
      state = JSON.parse(raw);
      return;
    } catch (e) {
      /* fall through */
    }
  }
  state = defaultState();
}

function save() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

// ---------- Helpers ----------

function fmtMoney(n) {
  const sign = n < 0 ? "-" : "";
  return sign + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtSigned(n) {
  return (n >= 0 ? "+" : "") + fmtMoney(n);
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

function spend(amount) {
  const actual = Math.min(amount, Math.max(0, state.cash));
  state.cash -= actual;
  return actual;
}

function ageLabel() {
  const totalWeeks = state.week - 1;
  const years = 22 + Math.floor(totalWeeks / 52);
  const weeks = totalWeeks % 52;
  return `${years}y ${weeks}w`;
}

function netWorth() {
  return state.cash + state.savings - state.studentLoan.balance - (state.businessLoan ? state.businessLoan.balance : 0);
}

function businessLoanApr(credit) {
  const t = clamp((credit - 300) / 550, 0, 1);
  return 0.18 - t * 0.11;
}

function jobTrack() {
  if (!state.degree) return null;
  return JOB_TRACKS[DEGREES[state.degree].track];
}

function degreeSkillKey() {
  return state.degree ? DEGREES[state.degree].skill : null;
}

// ---------- Onboarding ----------

function chooseDegree(id) {
  if (!DEGREES[id]) return;
  state = defaultState();
  state.degree = id;
  save();
  renderAll();
}

function resetGame() {
  if (!confirm("Start a new life? Your current progress will be lost.")) return;
  state = defaultState();
  save();
  renderAll();
}

// ---------- Job ----------

function applyForJob() {
  if (state.job) return;
  state.job = { levelIndex: 0, weeksAtLevel: 0 };
  save();
  renderAll();
}

function promotionEligible() {
  if (!state.job) return false;
  const track = jobTrack();
  const next = track[state.job.levelIndex + 1];
  if (!next) return false;
  const skill = state.skills[degreeSkillKey()];
  return state.job.weeksAtLevel >= next.weeksReq && skill >= next.skillReq;
}

function applyForPromotion() {
  if (!promotionEligible()) return;
  state.job.levelIndex += 1;
  state.job.weeksAtLevel = 0;
  save();
  renderAll();
}

function quitJob() {
  if (!state.job) return;
  if (!confirm("Quit your job? You'll lose your income and progress toward promotion.")) return;
  state.job = null;
  save();
  renderAll();
}

// ---------- Business ----------

function currentBusinessTier() {
  return state.business ? BUSINESS_TIERS[state.business.tier] : null;
}

function targetTierIndex() {
  return state.business ? state.business.tier + 1 : 0;
}

function startOrExpandBusiness(mode) {
  const idx = targetTierIndex();
  const tier = BUSINESS_TIERS[idx];
  if (!tier || tier.startCost === Infinity) return;

  if (mode === "cash") {
    if (state.cash < tier.startCost * 1.1) {
      alert("Not enough cash — you'd have nothing left for rent and groceries.");
      return;
    }
    state.cash -= tier.startCost;
  } else if (mode === "loan") {
    const downPayment = tier.startCost * 0.3;
    if (state.cash < downPayment * 1.1) {
      alert("Not enough cash for the down payment.");
      return;
    }
    state.cash -= downPayment;
    const principal = tier.startCost - downPayment;
    const apr = businessLoanApr(state.creditScore);
    if (state.businessLoan) {
      const oldBal = state.businessLoan.balance;
      const blendedApr = (oldBal * state.businessLoan.apr + principal * apr) / (oldBal + principal);
      state.businessLoan.balance += principal;
      state.businessLoan.apr = blendedApr;
      state.businessLoan.minPayment = Math.max(40, state.businessLoan.balance * 0.07);
    } else {
      state.businessLoan = { balance: principal, apr, minPayment: Math.max(40, principal * 0.07) };
    }
  } else {
    return;
  }

  const carriedEmployees = state.business ? state.business.employees : 0;
  const carriedRep = state.business ? state.business.reputation : 50;
  state.business = {
    tier: idx,
    inventory: 0,
    price: tier.idealPrice,
    marketing: 0,
    employees: Math.min(carriedEmployees, tier.maxEmployees),
    reputation: clamp(idx === 0 ? 50 : carriedRep - 5, 0, 100),
  };
  save();
  renderAll();
}

function buyInventory(requestedQty) {
  const tier = currentBusinessTier();
  if (!tier) return;
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
  state.business.inventory += affordableQty;
  save();
  renderAll();
}

function hireEmployee() {
  const tier = currentBusinessTier();
  if (!tier) return;
  if (state.business.employees >= tier.maxEmployees) {
    alert(`Max staff for ${tier.name} is ${tier.maxEmployees}.`);
    return;
  }
  const onboardCost = tier.employeeWage;
  if (onboardCost > state.cash) {
    alert("Not enough cash to hire.");
    return;
  }
  state.cash -= onboardCost;
  state.business.employees += 1;
  save();
  renderAll();
}

function fireEmployee() {
  if (!state.business || state.business.employees <= 0) return;
  state.business.employees -= 1;
  save();
  renderAll();
}

function setBusinessPrice(v) {
  if (!state.business) return;
  state.business.price = Math.max(0, parseFloat(v) || 0);
  save();
}

function setBusinessMarketing(v) {
  if (!state.business) return;
  state.business.marketing = Math.max(0, parseFloat(v) || 0);
  save();
}

// ---------- Banking ----------

function depositToSavings(amount) {
  amount = Math.max(0, amount);
  if (amount <= 0 || amount > state.cash) return;
  state.cash -= amount;
  state.savings += amount;
  save();
  renderAll();
}

function withdrawFromSavings(amount) {
  amount = Math.max(0, amount);
  if (amount <= 0 || amount > state.savings) return;
  state.savings -= amount;
  state.cash += amount;
  save();
  renderAll();
}

function payExtraOnLoan(which, amount) {
  amount = Math.max(0, amount);
  const loan = which === "student" ? state.studentLoan : state.businessLoan;
  if (!loan || amount <= 0 || amount > state.cash) return;
  const paid = Math.min(amount, loan.balance);
  state.cash -= paid;
  loan.balance -= paid;
  if (which === "business" && loan.balance <= 0) state.businessLoan = null;
  save();
  renderAll();
}

// ---------- Skills ----------

function trainSkill(key) {
  if (!state.skills.hasOwnProperty(key)) return;
  const cost = Math.round(200 + state.skills[key] * 15);
  if (state.cash < cost) {
    alert(`Not enough cash — a course costs ${fmtMoney(cost)}.`);
    return;
  }
  state.cash -= cost;
  state.skills[key] = clamp(state.skills[key] + 8, 0, 100);
  save();
  renderAll();
}

// ---------- Life ----------

function moveHousing(tierIndex) {
  if (tierIndex === state.housingTier) return;
  if (state.cash < MOVE_FEE) {
    alert(`Moving costs ${fmtMoney(MOVE_FEE)} and you don't have it.`);
    return;
  }
  state.cash -= MOVE_FEE;
  state.housingTier = tierIndex;
  save();
  renderAll();
}

// ---------- Weekly turn ----------

function pickBusinessEvent(tier) {
  const weatherPool = BUSINESS_EVENTS.filter((e) => e.weatherOnly);
  const otherPool = BUSINESS_EVENTS.filter((e) => !e.weatherOnly);
  let weather = null;
  if (tier.weatherSensitive) weather = weightedPick(weatherPool);
  let other = null;
  if (Math.random() < 0.55) other = weightedPick(otherPool);
  return { weather, other };
}

function advanceWeek() {
  const income = [];
  const expenses = [];
  const notes = [];

  state.week += 1;

  // --- Job ---
  if (state.job) {
    const track = jobTrack();
    const level = track[state.job.levelIndex];
    const variance = level.variance || 0;
    const gross = level.weeklyPay * (1 + (Math.random() * 2 - 1) * variance);
    const tax = gross * TAX_RATE_JOB;
    income.push({ label: `${level.title} (gross)`, amount: gross });
    expenses.push({ label: "Income Tax", amount: tax });
    state.cash += gross - tax;
    state.job.weeksAtLevel += 1;
    const sk = degreeSkillKey();
    state.skills[sk] = clamp(state.skills[sk] + 0.3, 0, 100);
  } else {
    notes.push("Unemployed this week — no job income.");
  }

  // --- Business ---
  if (state.business) {
    const tier = BUSINESS_TIERS[state.business.tier];
    const b = state.business;
    const { weather, other } = pickBusinessEvent(tier);

    const ratio = b.price / tier.idealPrice;
    const priceFactor = clamp(2 - ratio, 0.1, 1.5);
    const repFactor = 0.5 + b.reputation / 100;
    const marketingFactor = 1 + Math.min(b.marketing / (tier.idealPrice * 50), 0.8);
    const weatherFactor = weather ? weather.factor : 1;
    const otherFactor = other ? other.factor : 1;

    const demand = tier.baseDemand * priceFactor * repFactor * marketingFactor * weatherFactor * otherFactor;
    const capacity = tier.baseCapacity + b.employees * tier.employeeCapacityBonus;
    const unitsSold = Math.max(0, Math.floor(Math.min(demand, b.inventory, capacity)));

    const revenue = unitsSold * b.price;
    const wages = b.employees * tier.employeeWage;
    const eventCashHit = other && other.cashHitMultiplier ? tier.fixedCost * other.cashHitMultiplier : 0;
    const opCosts = wages + tier.fixedCost + b.marketing + eventCashHit;
    const profit = revenue - opCosts;
    const bizTax = profit > 0 ? profit * TAX_RATE_BUSINESS : 0;

    income.push({ label: `${tier.name} Revenue`, amount: revenue });
    expenses.push({ label: `${tier.name} Operating Costs`, amount: opCosts });
    if (bizTax > 0) expenses.push({ label: "Business Tax", amount: bizTax });
    state.cash += profit - bizTax;

    let leftover = b.inventory - unitsSold;
    if (tier.perishable > 0) leftover = Math.floor(leftover * (1 - tier.perishable));
    b.inventory = leftover;

    let repDelta = 0;
    const unmetDemand = demand - unitsSold;
    if (unmetDemand > demand * 0.25) repDelta -= 1;
    if (ratio > 1.3) repDelta -= 1;
    if (ratio < 0.9 && unitsSold > 0) repDelta += 1;
    if (capacity > 0 && unitsSold >= capacity * 0.9) repDelta += 1;
    if (weather && weather.rep) repDelta += weather.rep;
    if (other && other.rep) repDelta += other.rep;
    repDelta += (50 - b.reputation) * 0.03;
    b.reputation = clamp(b.reputation + repDelta, 0, 100);

    if (weather && !weather.silent) notes.push(weather.name);
    if (other && !other.silent) notes.push(other.name);

    state.skills.management = clamp(state.skills.management + 0.2, 0, 100);
  }

  // --- Savings interest ---
  const interest = state.savings * (SAVINGS_APR / 52);
  if (interest > 0.005) {
    state.savings += interest;
    income.push({ label: "Savings Interest", amount: interest });
  }

  // --- Rent & living costs ---
  const rent = spend(HOUSING[state.housingTier].rent);
  expenses.push({ label: `Rent (${HOUSING[state.housingTier].name})`, amount: rent });
  const groceries = spend(LIVING_GROCERIES);
  expenses.push({ label: "Groceries", amount: groceries });
  const bills = spend(LIVING_BILLS);
  expenses.push({ label: "Bills", amount: bills });

  // --- Random life event ---
  if (Math.random() < WEEKLY_EVENT_CHANCE) {
    const ev = weightedPick(RANDOM_LIFE_EVENTS);
    if (ev.amount >= 0) {
      const paid = spend(ev.amount);
      expenses.push({ label: ev.name, amount: paid, warn: true });
    } else {
      const gain = -ev.amount;
      state.cash += gain;
      income.push({ label: ev.name, amount: gain });
    }
  }

  // --- Loan interest accrual ---
  state.studentLoan.balance += state.studentLoan.balance * (state.studentLoan.apr / 52);
  if (state.businessLoan) {
    state.businessLoan.balance += state.businessLoan.balance * (state.businessLoan.apr / 52);
  }

  // --- Loan payments every 4 weeks ---
  state.weeksSinceLoanPayment += 1;
  if (state.weeksSinceLoanPayment >= 4) {
    state.weeksSinceLoanPayment = 0;
    let allPaidInFull = true;

    const studentDue = state.studentLoan.minPayment;
    const studentPaid = spend(studentDue);
    state.studentLoan.balance -= studentPaid;
    expenses.push({ label: "Student Loan Payment", amount: studentPaid, warn: studentPaid < studentDue - 0.01 });
    if (studentPaid < studentDue - 0.01) {
      allPaidInFull = false;
      state.studentLoan.balance += 35;
      notes.push("Missed your full student loan payment — a $35 late fee was added.");
    }

    if (state.businessLoan) {
      const bizDue = state.businessLoan.minPayment;
      const bizPaid = spend(bizDue);
      state.businessLoan.balance -= bizPaid;
      expenses.push({ label: "Business Loan Payment", amount: bizPaid, warn: bizPaid < bizDue - 0.01 });
      if (bizPaid < bizDue - 0.01) {
        allPaidInFull = false;
        state.businessLoan.balance += 35;
        notes.push("Missed your full business loan payment — a $35 late fee was added.");
      } else if (state.businessLoan.balance <= 0) {
        state.businessLoan = null;
        notes.push("Business loan paid off!");
      }
    }

    state.creditScore = clamp(state.creditScore + (allPaidInFull ? 6 : -35), 300, 850);
  }

  const totalIncome = income.reduce((s, l) => s + l.amount, 0);
  const totalExpense = expenses.reduce((s, l) => s + l.amount, 0);
  const netChange = totalIncome - totalExpense;

  const report = { week: state.week, income, expenses, netChange, notes };
  state.log.unshift(report);
  state.log = state.log.slice(0, 30);
  state.history.push(netWorth());
  state.history = state.history.slice(-60);

  save();
  renderAll();
}

// ---------- Rendering ----------

function tierProgress(track, job) {
  const next = track[job.levelIndex + 1];
  if (!next) return null;
  const weeksPct = clamp((job.weeksAtLevel / next.weeksReq) * 100, 0, 100);
  const skill = state.skills[degreeSkillKey()];
  const skillPct = clamp((skill / next.skillReq) * 100, 0, 100);
  return { next, weeksPct, skillPct, skill };
}

function renderReportLine(l) {
  return `<div class="row${l.warn ? " row-warn" : ""}">
    <span>${l.warn ? "⚠️ " : ""}${l.label}</span>
    <span>${fmtMoney(l.amount)}</span>
  </div>`;
}

function renderHome() {
  const nw = netWorth();
  const latest = state.log[0];

  let reportHtml;
  if (!latest) {
    reportHtml = `<div class="card"><p class="muted">No reports yet — advance the week to get started.</p></div>`;
  } else {
    const totalIncome = latest.income.reduce((s, l) => s + l.amount, 0);
    const totalExpense = latest.expenses.reduce((s, l) => s + l.amount, 0);
    reportHtml = `
      <div class="card">
        <div class="card-header income-header">Income — Week ${latest.week}</div>
        ${latest.income.map(renderReportLine).join("") || `<div class="row"><span class="muted">Nothing this week</span></div>`}
        <div class="row total"><span>Total</span><span class="pos">${fmtMoney(totalIncome)}</span></div>
      </div>
      <div class="card">
        <div class="card-header expense-header">Expenses</div>
        ${latest.expenses.map(renderReportLine).join("") || `<div class="row"><span class="muted">Nothing this week</span></div>`}
        <div class="row total"><span>Total</span><span class="neg">${fmtMoney(totalExpense)}</span></div>
      </div>
      <div class="card net-card">
        <div class="row total"><span>Net for the Week</span><span class="${latest.netChange >= 0 ? "pos" : "neg"}">${fmtSigned(latest.netChange)}</span></div>
      </div>
      ${latest.notes.length ? `<div class="card notes-card">${latest.notes.map((n) => `<div class="note">${n}</div>`).join("")}</div>` : ""}
    `;
  }

  const history = state.log.slice(1, 8);

  return `
    <div class="card summary-card">
      <div class="row"><span>Net Worth</span><span class="${nw >= 0 ? "pos" : "neg"} big">${fmtMoney(nw)}</span></div>
      <div class="row"><span>Checking</span><span>${fmtMoney(state.cash)}</span></div>
      <div class="row"><span>Savings</span><span>${fmtMoney(state.savings)}</span></div>
      <div class="row"><span>Student Loan</span><span class="neg">${fmtMoney(state.studentLoan.balance)}</span></div>
      ${state.businessLoan ? `<div class="row"><span>Business Loan</span><span class="neg">${fmtMoney(state.businessLoan.balance)}</span></div>` : ""}
    </div>
    <canvas id="netWorthChart" width="400" height="120"></canvas>
    ${reportHtml}
    ${history.length ? `
      <div class="card">
        <div class="card-header">Previous Weeks</div>
        ${history.map((r) => `<div class="row"><span>Week ${r.week}</span><span class="${r.netChange >= 0 ? "pos" : "neg"}">${fmtSigned(r.netChange)}</span></div>`).join("")}
      </div>` : ""}
    <button class="ghost" data-action="reset-game">Start a New Life</button>
  `;
}

function renderJob() {
  if (!state.degree) return "";
  const track = jobTrack();
  const deg = DEGREES[state.degree];

  if (!state.job) {
    const entry = track[0];
    return `
      <div class="card">
        <div class="card-header">${deg.label} Track <span class="badge">${deg.difficulty}</span></div>
        <p class="muted">${deg.blurb}</p>
      </div>
      <div class="card">
        <div class="card-header">Available Position</div>
        <div class="row"><span>${entry.title}</span><span>${fmtMoney(entry.weeklyPay)}/wk</span></div>
        <button class="primary" data-action="apply-job">Apply</button>
      </div>
      ${renderLadder(track, -1)}
    `;
  }

  const level = track[state.job.levelIndex];
  const prog = tierProgress(track, state.job);
  return `
    <div class="card">
      <div class="card-header">Current Job</div>
      <div class="row"><span>${level.title}</span><span>${fmtMoney(level.weeklyPay)}/wk</span></div>
      <div class="row"><span>Weeks at this level</span><span>${state.job.weeksAtLevel}</span></div>
      <button class="ghost" data-action="quit-job">Quit Job</button>
    </div>
    ${prog ? `
      <div class="card">
        <div class="card-header">Promotion — ${prog.next.title}</div>
        <p class="hint">Requires ${prog.next.weeksReq} weeks at this level and ${prog.next.skillReq} ${degreeSkillKey()}.</p>
        <div class="progress"><div class="progress-label">Time</div><div class="bar"><div class="bar-fill" style="width:${prog.weeksPct}%"></div></div></div>
        <div class="progress"><div class="progress-label">Skill</div><div class="bar"><div class="bar-fill" style="width:${prog.skillPct}%"></div></div></div>
        <button class="primary" data-action="apply-promotion" ${promotionEligible() ? "" : "disabled"}>Apply for Promotion</button>
      </div>` : `<div class="card"><p class="muted">You've reached the top of the ${deg.label} ladder.</p></div>`}
    ${renderLadder(track, state.job.levelIndex)}
  `;
}

function renderLadder(track, currentIndex) {
  return `
    <div class="card">
      <div class="card-header">Career Ladder</div>
      ${track.map((lvl, i) => `<div class="row${i === currentIndex ? " row-current" : ""}"><span>${i === currentIndex ? "→ " : ""}${lvl.title}</span><span>${fmtMoney(lvl.weeklyPay)}/wk</span></div>`).join("")}
    </div>
  `;
}

function renderBusiness() {
  const idx = targetTierIndex();
  const nextTier = BUSINESS_TIERS[idx];

  let ownedHtml = "";
  if (state.business) {
    const tier = BUSINESS_TIERS[state.business.tier];
    const b = state.business;
    const capacity = tier.baseCapacity + b.employees * tier.employeeCapacityBonus;
    ownedHtml = `
      <div class="card">
        <div class="card-header">${tier.emoji} ${tier.name}</div>
        <p class="muted">Selling ${tier.product}</p>
        <div class="row"><span>Reputation</span><span>${Math.round(b.reputation)}%</span></div>
        <div class="row"><span>Weekly capacity</span><span>${capacity} units</span></div>
        <div class="row"><span>Fixed costs/wk</span><span>${fmtMoney(tier.fixedCost)}</span></div>
        <div class="row"><span>Unit cost</span><span>${fmtMoney(tier.unitCost)}</span></div>
      </div>
      <div class="card">
        <div class="card-header">Run Your Business</div>
        <div class="field">
          <label>Price per unit (typical ${fmtMoney(tier.idealPrice)})</label>
          <input type="number" id="priceInput" min="0" step="0.01" value="${b.price}">
        </div>
        <div class="field">
          <label>Buy inventory (${fmtMoney(tier.unitCost)} each) — on hand: ${b.inventory}</label>
          <div class="inline">
            <input type="number" id="buyQtyInput" min="0" step="1" value="0">
            <button data-action="buy-inventory">Buy</button>
          </div>
        </div>
        <div class="field">
          <label>Marketing spend this week</label>
          <input type="number" id="marketingInput" min="0" step="1" value="${b.marketing}">
        </div>
        <div class="field">
          <label>Staff (${fmtMoney(tier.employeeWage)}/wk each, max ${tier.maxEmployees})</label>
          <div class="inline">
            <button data-action="fire-employee">– Fire</button>
            <span>${b.employees}</span>
            <button data-action="hire-employee">+ Hire</button>
          </div>
        </div>
      </div>
    `;
  } else {
    ownedHtml = `<div class="card"><p class="muted">You don't own a business yet.</p></div>`;
  }

  let expandHtml = "";
  if (nextTier && nextTier.startCost !== Infinity) {
    const downPayment = nextTier.startCost * 0.3;
    const apr = businessLoanApr(state.creditScore);
    expandHtml = `
      <div class="card">
        <div class="card-header">${state.business ? "Expand to" : "Start"}: ${nextTier.emoji} ${nextTier.name}</div>
        <p class="muted">Selling ${nextTier.product}</p>
        <div class="row"><span>Full price</span><span>${fmtMoney(nextTier.startCost)}</span></div>
        <div class="row"><span>Down payment + loan</span><span>${fmtMoney(downPayment)} down, ${(apr * 100).toFixed(1)}% APR</span></div>
        <button class="primary" data-action="start-business-cash">Pay Cash</button>
        <button class="ghost" data-action="start-business-loan">Down Payment + Loan</button>
      </div>
    `;
  } else if (nextTier) {
    expandHtml = `<div class="card"><p class="muted">You've built the biggest business there is.</p></div>`;
  }

  return ownedHtml + expandHtml;
}

function renderBanking() {
  const bl = state.businessLoan;
  return `
    <div class="card">
      <div class="card-header">Accounts</div>
      <div class="row"><span>Checking</span><span>${fmtMoney(state.cash)}</span></div>
      <div class="row"><span>Savings (${(SAVINGS_APR * 100).toFixed(1)}% APY)</span><span>${fmtMoney(state.savings)}</span></div>
      <div class="row"><span>Credit Score</span><span>${Math.round(state.creditScore)}</span></div>
    </div>
    <div class="card">
      <div class="card-header">Transfer</div>
      <div class="field">
        <label>Amount</label>
        <input type="number" id="transferAmount" min="0" step="1" value="0">
      </div>
      <div class="inline">
        <button data-action="deposit">Deposit to Savings</button>
        <button data-action="withdraw">Withdraw to Checking</button>
      </div>
    </div>
    <div class="card">
      <div class="card-header">Student Loan</div>
      <div class="row"><span>Balance</span><span class="neg">${fmtMoney(state.studentLoan.balance)}</span></div>
      <div class="row"><span>APR</span><span>${(state.studentLoan.apr * 100).toFixed(1)}%</span></div>
      <div class="row"><span>Min payment (every 4wk)</span><span>${fmtMoney(state.studentLoan.minPayment)}</span></div>
      <div class="row"><span>Next payment due</span><span>${4 - state.weeksSinceLoanPayment} wk</span></div>
      <div class="field">
        <label>Extra payment</label>
        <input type="number" id="extraStudentAmount" min="0" step="1" value="0">
      </div>
      <button data-action="pay-extra-student">Pay Extra</button>
    </div>
    ${bl ? `
      <div class="card">
        <div class="card-header">Business Loan</div>
        <div class="row"><span>Balance</span><span class="neg">${fmtMoney(bl.balance)}</span></div>
        <div class="row"><span>APR</span><span>${(bl.apr * 100).toFixed(1)}%</span></div>
        <div class="row"><span>Min payment (every 4wk)</span><span>${fmtMoney(bl.minPayment)}</span></div>
        <div class="field">
          <label>Extra payment</label>
          <input type="number" id="extraBusinessAmount" min="0" step="1" value="0">
        </div>
        <button data-action="pay-extra-business">Pay Extra</button>
      </div>` : ""}
  `;
}

const SKILL_INFO = {
  networking: { label: "Networking", helps: "Law promotions" },
  clinical: { label: "Clinical", helps: "Nursing promotions" },
  management: { label: "Management", helps: "Finance promotions & business" },
  branding: { label: "Branding", helps: "Marketing promotions" },
  craft: { label: "Craft", helps: "Art promotions" },
  performance: { label: "Performance", helps: "Music promotions" },
};

function renderSkills() {
  return `
    <div class="card">
      <div class="card-header">Skills</div>
      <p class="hint">Skills rise slowly from work, or buy a course to boost one directly.</p>
      ${Object.keys(SKILL_INFO).map((key) => {
        const v = state.skills[key];
        const cost = Math.round(200 + v * 15);
        return `
          <div class="field">
            <label>${SKILL_INFO[key].label} — helps ${SKILL_INFO[key].helps}</label>
            <div class="bar"><div class="bar-fill" style="width:${v}%"></div></div>
            <div class="inline" style="margin-top:6px">
              <span class="muted">${Math.round(v)}/100</span>
              <button data-action="train-skill" data-skill="${key}">Take a Course (${fmtMoney(cost)})</button>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderLife() {
  return `
    <div class="card">
      <div class="card-header">Housing</div>
      ${HOUSING.map((h, i) => `
        <div class="row${i === state.housingTier ? " row-current" : ""}">
          <span>${i === state.housingTier ? "→ " : ""}${h.name}</span>
          <span>${fmtMoney(h.rent)}/wk ${i !== state.housingTier ? `<button data-action="move-housing" data-tier="${i}">Move In</button>` : ""}</span>
        </div>
      `).join("")}
      <p class="hint">Moving costs ${fmtMoney(MOVE_FEE)}.</p>
    </div>
    <div class="card">
      <div class="card-header">Weekly Fixed Costs</div>
      <div class="row"><span>Groceries</span><span>${fmtMoney(LIVING_GROCERIES)}</span></div>
      <div class="row"><span>Bills</span><span>${fmtMoney(LIVING_BILLS)}</span></div>
      <div class="row"><span>Rent</span><span>${fmtMoney(HOUSING[state.housingTier].rent)}</span></div>
    </div>
  `;
}

function drawNetWorthChart() {
  const canvas = document.getElementById("netWorthChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.clientWidth || canvas.width;
  const cssH = canvas.clientHeight || canvas.height;
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const w = cssW, h = cssH;
  const padL = 6, padR = 6, padT = 10, padB = 10;
  ctx.clearRect(0, 0, w, h);

  const styles = getComputedStyle(document.documentElement);
  const ruleColor = styles.getPropertyValue("--rule").trim();
  const incomeColor = styles.getPropertyValue("--income").trim();
  const expenseColor = styles.getPropertyValue("--expense").trim();

  const data = state.history.length >= 2 ? state.history : [netWorth(), netWorth()];
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const lineColor = data[data.length - 1] >= data[0] ? incomeColor : expenseColor;

  const xAt = (i) => padL + (i / (data.length - 1)) * (w - padL - padR);
  const yAt = (v) => h - padB - ((v - min) / range) * (h - padT - padB);

  ctx.strokeStyle = ruleColor;
  ctx.lineWidth = 1;
  for (let g = 0; g <= 2; g++) {
    const y = padT + (g / 2) * (h - padT - padB);
    ctx.beginPath();
    ctx.moveTo(padL, Math.round(y) + 0.5);
    ctx.lineTo(w - padR, Math.round(y) + 0.5);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.moveTo(xAt(0), yAt(data[0]));
  data.forEach((v, i) => ctx.lineTo(xAt(i), yAt(v)));
  ctx.lineTo(xAt(data.length - 1), h - padB);
  ctx.lineTo(xAt(0), h - padB);
  ctx.closePath();
  ctx.fillStyle = lineColor + "22";
  ctx.fill();

  ctx.beginPath();
  data.forEach((v, i) => {
    const x = xAt(i), y = yAt(v);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.stroke();

  const lastX = xAt(data.length - 1);
  const lastY = yAt(data[data.length - 1]);
  ctx.beginPath();
  ctx.arc(lastX, lastY, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = lineColor;
  ctx.fill();
}

function renderAll() {
  const onboarding = document.getElementById("onboarding");
  const game = document.getElementById("game");

  if (!state.degree) {
    onboarding.classList.remove("hidden");
    game.classList.add("hidden");
    return;
  }
  onboarding.classList.add("hidden");
  game.classList.remove("hidden");

  document.getElementById("ageValue").textContent = ageLabel();
  document.getElementById("weekValue").textContent = `Week ${state.week}`;
  const nw = netWorth();
  const nwEl = document.getElementById("netWorthValue");
  nwEl.textContent = fmtMoney(nw);
  nwEl.className = nw >= 0 ? "pos" : "neg";

  const panels = { home: renderHome, job: renderJob, business: renderBusiness, banking: renderBanking, skills: renderSkills, life: renderLife };
  for (const [tab, fn] of Object.entries(panels)) {
    const el = document.getElementById(`tab-${tab}`);
    el.innerHTML = fn();
    el.classList.toggle("hidden", state.activeTab !== tab);
  }

  document.querySelectorAll("#bottomNav button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === state.activeTab);
  });

  drawNetWorthChart();
}

// ---------- Status bar clock ----------

function updateStatusTime() {
  const el = document.getElementById("statusTime");
  if (!el) return;
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  el.textContent = `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}

// ---------- Wiring ----------

function init() {
  load();
  updateStatusTime();
  setInterval(updateStatusTime, 30000);

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.dataset.action;

    switch (action) {
      case "choose-degree":
        chooseDegree(btn.dataset.degree);
        break;
      case "switch-tab":
        state.activeTab = btn.dataset.tab;
        save();
        renderAll();
        break;
      case "advance-week":
        advanceWeek();
        break;
      case "apply-job":
        applyForJob();
        break;
      case "apply-promotion":
        applyForPromotion();
        break;
      case "quit-job":
        quitJob();
        break;
      case "start-business-cash":
        startOrExpandBusiness("cash");
        break;
      case "start-business-loan":
        startOrExpandBusiness("loan");
        break;
      case "buy-inventory":
        buyInventory(parseInt(document.getElementById("buyQtyInput").value, 10) || 0);
        break;
      case "hire-employee":
        hireEmployee();
        break;
      case "fire-employee":
        fireEmployee();
        break;
      case "deposit":
        depositToSavings(parseFloat(document.getElementById("transferAmount").value) || 0);
        break;
      case "withdraw":
        withdrawFromSavings(parseFloat(document.getElementById("transferAmount").value) || 0);
        break;
      case "pay-extra-student":
        payExtraOnLoan("student", parseFloat(document.getElementById("extraStudentAmount").value) || 0);
        break;
      case "pay-extra-business":
        payExtraOnLoan("business", parseFloat(document.getElementById("extraBusinessAmount").value) || 0);
        break;
      case "train-skill":
        trainSkill(btn.dataset.skill);
        break;
      case "move-housing":
        moveHousing(parseInt(btn.dataset.tier, 10));
        break;
      case "reset-game":
        resetGame();
        break;
    }
  });

  document.addEventListener("change", (e) => {
    if (e.target.id === "priceInput") setBusinessPrice(e.target.value);
    if (e.target.id === "marketingInput") setBusinessMarketing(e.target.value);
  });

  renderAll();
}

document.addEventListener("DOMContentLoaded", init);
