<script>
  function clamp(value, min, max) {
    const n = Number(value);
    if (isNaN(n)) return min;
    return Math.min(Math.max(n, min), max);
  }

  function formatCurrency(value) {
    return "$" + value.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  function calculateEstimate() {
    const txSelect = document.getElementById("transactions");
    const txBandIndex = txSelect.selectedIndex;

    const bankAccounts = clamp(
      document.getElementById("bank-accounts").value,
      0,
      20
    );

    const cardAccounts = clamp(
      document.getElementById("card-accounts").value,
      0,
      30
    );

    const employees = clamp(
      document.getElementById("employees").value,
      0,
      250
    );

    const monthsBehind = clamp(
      document.getElementById("months-behind").value,
      0,
      36
    );

    const currentMethod = document.getElementById("current-method").value;

    const totalAccounts = bankAccounts + cardAccounts;
    const hasPayroll = employees > 0;
    const heavyTransactions = txBandIndex >= 3;      // 301-600 or 600+
    const moderateTransactions = txBandIndex === 2;  // 151-300
    const lowTransactions = txBandIndex <= 1;        // up to 150

    let tierName = "";
    let tierAudience = "";
    let monthlyLow = 0;
    let monthlyHigh = 0;

    // Tier assignment
    if (lowTransactions && totalAccounts <= 4 && !hasPayroll) {
      tierName = "Starter";
      tierAudience = "Sole props, very low volume";
      monthlyLow = 300;
      monthlyHigh = 450;
    } else if (!heavyTransactions && totalAccounts <= 8 && employees <= 5) {
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

    // Score to position the estimate within the selected tier
    let score = 0;

    // Transactions
    if (txBandIndex === 0) score += 5;
    if (txBandIndex === 1) score += 15;
    if (txBandIndex === 2) score += 35;
    if (txBandIndex === 3) score += 70;
    if (txBandIndex === 4) score += 100;

    // Accounts
    if (totalAccounts >= 3 && totalAccounts <= 4) score += 10;
    if (totalAccounts >= 5 && totalAccounts <= 8) score += 25;
    if (totalAccounts >= 9) score += 45;

    // Employees
    if (employees >= 1 && employees <= 2) score += 15;
    if (employees >= 3 && employees <= 5) score += 30;
    if (employees >= 6) score += 50;

    // If books are not being done, nudge upward
    if (currentMethod === "none") score += 10;
    if (currentMethod === "in-house") score += 5;

    score = Math.min(score, 100);

    const recommendedMonthly = Math.round(
      monthlyLow + ((monthlyHigh - monthlyLow) * score / 100)
    );

    // Update main range
    document.getElementById("estimate-range").textContent =
      formatCurrency(monthlyLow) + " – " + formatCurrency(monthlyHigh) + "/mo";

    // Update breakdown
    document.getElementById("base-amount").textContent = tierName;
    document.getElementById("tx-amount").textContent = tierAudience;
    document.getElementById("account-amount").textContent =
      formatCurrency(recommendedMonthly) + "/mo";
    document.getElementById("payroll-amount").textContent =
      formatCurrency(monthlyLow) + " – " + formatCurrency(monthlyHigh) + "/mo";

    // Caption logic
    const captionEl = document.getElementById("estimate-caption");
    let caption = tierName + " package estimate for a small Oregon-based business.";

    if (currentMethod === "self") {
      caption =
        "Approximate monthly investment to move bookkeeping off your plate and into a reliable ongoing system.";
    } else if (currentMethod === "none") {
      caption =
        "Good starting point if bookkeeping has not really been maintained and you need to get things under control.";
    } else if (currentMethod === "other-bookkeeper") {
      caption =
        "Useful if you’re comparing your current bookkeeping arrangement against a more structured Oregon-based service.";
    } else if (currentMethod === "in-house") {
      caption =
        "Rough comparison point if you’re considering outsourcing work that is currently handled internally.";
    }

    captionEl.textContent = caption;

    // Cleanup estimate
    const cleanupText = document.getElementById("cleanup-text");

    if (monthsBehind <= 0) {
      cleanupText.textContent =
        "You’re current on your books, so no separate cleanup project is assumed.";
      return;
    }

    const cleanupLow = Math.round(monthlyLow * 0.75 * monthsBehind);
    const cleanupHigh = Math.round(monthlyHigh * 1.1 * monthsBehind);

    cleanupText.textContent =
      "Based on your inputs, a one-time catch-up project for about " +
      monthsBehind +
      (monthsBehind === 1 ? " month " : " months ") +
      "behind could reasonably land in the range of " +
      formatCurrency(cleanupLow) +
      " – " +
      formatCurrency(cleanupHigh) +
      ". Actual pricing would depend on record quality, account cleanup needs, and how much correction work is involved.";
  }

  // Attach listeners
  ["transactions", "bank-accounts", "card-accounts", "employees", "months-behind"].forEach(
    (id) => {
      document.getElementById(id).addEventListener("input", calculateEstimate);
      document.getElementById(id).addEventListener("change", calculateEstimate);
    }
  );

  document
    .getElementById("current-method")
    .addEventListener("change", calculateEstimate);

  calculateEstimate();
</script>    const lowMonthly = BASE_AMOUNT + txAmount + payrollAmount;
    const highMonthly = Math.round(lowMonthly * 1.25); // 25% buffer

    // ---- CLEANUP ESTIMATE (ONE-TIME) ----
    let cleanupLow = 0;
    let cleanupHigh = 0;
    if (wantsCleanup && monthsBehind > 0) {
      cleanupLow = Math.round(
        lowMonthly * CLEANUP_LOW_MULTIPLIER * monthsBehind
      );
      cleanupHigh = Math.round(
        highMonthly * CLEANUP_HIGH_MULTIPLIER * monthsBehind
      );
    }

    // ---- UPDATE BREAKDOWN ----
    document.getElementById("base-amount").textContent =
      formatCurrency(BASE_AMOUNT);
    document.getElementById("tx-amount").textContent =
      formatCurrency(txAmount);
    document.getElementById("payroll-amount").textContent =
      payrollAmount > 0 ? formatCurrency(payrollAmount) : "$0";

    const cleanupAmountEl = document.getElementById("cleanup-amount");
    if (cleanupLow > 0 && cleanupHigh > 0) {
      cleanupAmountEl.textContent =
        "≈ " +
        formatCurrency(cleanupLow) +
        " – " +
        formatCurrency(cleanupHigh) +
        " (one-time)";
    } else {
      cleanupAmountEl.textContent = "$0";
    }

    // ---- UPDATE MAIN RANGE ----
    document.getElementById("estimate-range").textContent =
      formatCurrency(lowMonthly) + " – " + formatCurrency(highMonthly);

    // ---- CAPTION LOGIC ----
    const captionEl = document.getElementById("estimate-caption");
    let caption = "Typical range for a small Oregon-based business.";

    if (wantsCleanup && monthsBehind > 0) {
      caption =
        "Ongoing monthly range shown above. One-time catch-up estimate is based on about " +
        monthsBehind +
        (monthsBehind === 1 ? " month" : " months") +
        " behind.";
    } else if (currentMethod === "none") {
      caption =
        "Good starting point if your books haven’t really been maintained yet.";
    } else if (currentMethod === "other-bookkeeper") {
      caption =
        "Useful if you’re comparing against your current bookkeeping setup.";
    } else if (currentMethod === "self") {
      caption =
        "Approximate investment to move bookkeeping off your plate each month.";
    }

    captionEl.textContent = caption;
  }

  // ---- EVENT LISTENERS ----
  document
    .getElementById("transactions")
    .addEventListener("change", calculateEstimate);

  document
    .getElementById("employees")
    .addEventListener("input", calculateEstimate);

  document
    .querySelectorAll("input[name='cleanup']")
    .forEach((el) =>
      el.addEventListener("change", (e) => {
        document
          .querySelectorAll("#cleanup-toggle .pill-toggle")
          .forEach((label) => label.classList.remove("active"));
        e.target.closest(".pill-toggle").classList.add("active");
        calculateEstimate();
      })
    );

  document
    .getElementById("current-method")
    .addEventListener("change", calculateEstimate);

  const monthsBehindInputInit = document.getElementById("months-behind");
  if (monthsBehindInputInit) {
    monthsBehindInputInit.addEventListener("input", calculateEstimate);
  }

  // Initial calc on load
  calculateEstimate();
</script>
