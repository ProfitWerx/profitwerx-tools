function clamp(value, min, max) {
  const n = Number(value);
  if (isNaN(n)) return min;
  return Math.min(Math.max(n, min), max);
}

function formatCurrency(value) {
  return "$" + value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

function calculateEstimate() {
  const txSelect = document.getElementById("transactions");
  const bankAccountsEl = document.getElementById("bank-accounts");
  const cardAccountsEl = document.getElementById("card-accounts");
  const employeesEl = document.getElementById("employees");
  const monthsBehindEl = document.getElementById("months-behind");
  const currentMethodEl = document.getElementById("current-method");

  if (!txSelect || !bankAccountsEl || !cardAccountsEl || !employeesEl || !monthsBehindEl || !currentMethodEl) {
    return;
  }

  const txBandIndex = txSelect.selectedIndex;
  const bankAccounts = clamp(bankAccountsEl.value, 0, 20);
  const cardAccounts = clamp(cardAccountsEl.value, 0, 30);
  const employees = clamp(employeesEl.value, 0, 250);
  const monthsBehind = clamp(monthsBehindEl.value, 0, 36);
  const currentMethod = currentMethodEl.value;

  const totalAccounts = bankAccounts + cardAccounts;
  const adjustedAccounts = Math.max(1, totalAccounts);

  const heavyTransactions = txBandIndex >= 3; // 301–600 or 600+
  const lowTransactions = txBandIndex <= 1;   // up to 150

  let tierName = "";
  let tierAudience = "";
  let monthlyLow = 0;
  let monthlyHigh = 0;

  if (lowTransactions && adjustedAccounts <= 4 && employees === 0) {
    tierName = "Starter";
    tierAudience = "Sole props, very low volume";
    monthlyLow = 300;
    monthlyHigh = 450;
  } else if (!heavyTransactions && adjustedAccounts <= 8 && employees <= 5) {
    tierName = "Growth";
    tierAudience = "LLCs, moderate transactions";
    monthlyLow = 550;
    monthlyHigh = 800;
  } else {
    tierName = "Full-Service";
    tierAudience = "Multiple accounts, payroll, reporting";
    monthlyLow = 900;
    monthlyHigh = 1200;
  }

  let score = 0;

  // transactions
  if (txBandIndex === 0) score += 0;
  if (txBandIndex === 1) score += 12;
  if (txBandIndex === 2) score += 35;
  if (txBandIndex === 3) score += 70;
  if (txBandIndex === 4) score += 100;

  // accounts
  if (adjustedAccounts >= 2 && adjustedAccounts <= 4) score += 10;
  if (adjustedAccounts >= 5 && adjustedAccounts <= 8) score += 25;
  if (adjustedAccounts >= 9) score += 45;

  // employees
  if (employees >= 1 && employees <= 2) score += 15;
  if (employees >= 3 && employees <= 5) score += 30;
  if (employees >= 6) score += 50;

  // current bookkeeping setup
  if (currentMethod === "none") score += 10;
  if (currentMethod === "in-house") score += 5;

  score = Math.min(score, 100);

  const recommendedMonthly = Math.round(
    monthlyLow + ((monthlyHigh - monthlyLow) * score / 100)
  );

  const estimateRangeEl = document.getElementById("estimate-range");
  const estimateCaptionEl = document.getElementById("estimate-caption");
  const baseAmountEl = document.getElementById("base-amount");
  const txAmountEl = document.getElementById("tx-amount");
  const accountAmountEl = document.getElementById("account-amount");
  const payrollAmountEl = document.getElementById("payroll-amount");
  const cleanupTextEl = document.getElementById("cleanup-text");

  if (estimateRangeEl) {
    estimateRangeEl.textContent =
      formatCurrency(monthlyLow) + " – " + formatCurrency(monthlyHigh) + "/mo";
  }

  if (baseAmountEl) baseAmountEl.textContent = tierName;
  if (txAmountEl) txAmountEl.textContent = tierAudience;
  if (accountAmountEl) accountAmountEl.textContent = formatCurrency(recommendedMonthly) + "/mo";
  if (payrollAmountEl) payrollAmountEl.textContent =
    formatCurrency(monthlyLow) + " – " + formatCurrency(monthlyHigh) + "/mo";

  if (estimateCaptionEl) {
    let caption = tierName + " package estimate for a small Oregon-based business.";

    if (currentMethod === "self") {
      caption = "Approximate monthly investment to move bookkeeping off your plate and into a reliable ongoing system.";
    } else if (currentMethod === "none") {
      caption = "Good starting point if bookkeeping has not really been maintained and you need to get things under control.";
    } else if (currentMethod === "other-bookkeeper") {
      caption = "Useful if you’re comparing your current bookkeeping arrangement against a more structured Oregon-based service.";
    } else if (currentMethod === "in-house") {
      caption = "Rough comparison point if you’re considering outsourcing work that is currently handled internally.";
    }

    estimateCaptionEl.textContent = caption;
  }

  if (cleanupTextEl) {
    if (monthsBehind <= 0) {
      cleanupTextEl.textContent =
        "You’re current on your books, so no separate cleanup project is assumed.";
    } else {
      const cleanupLow = Math.round(monthlyLow * 0.75 * monthsBehind);
      const cleanupHigh = Math.round(monthlyHigh * 1.1 * monthsBehind);

      cleanupTextEl.textContent =
        "Based on your inputs, a one-time catch-up project for about " +
        monthsBehind +
        (monthsBehind === 1 ? " month " : " months ") +
        "behind could reasonably land in the range of " +
        formatCurrency(cleanupLow) +
        " – " +
        formatCurrency(cleanupHigh) +
        ". Actual pricing would depend on record quality, account cleanup needs, payroll complexity, and how much correction work is involved.";
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  ["transactions", "bank-accounts", "card-accounts", "employees", "months-behind"].forEach(function (id) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", calculateEstimate);
      el.addEventListener("change", calculateEstimate);
    }
  });

  const currentMethodEl = document.getElementById("current-method");
  if (currentMethodEl) {
    currentMethodEl.addEventListener("change", calculateEstimate);
  }

  calculateEstimate();
});
