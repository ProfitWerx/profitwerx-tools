<script>
  function formatCurrency(value) {
    return "$" + value.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }

  function calculateEstimate() {
    const txSelect = document.getElementById("transactions");
    const employeesInput = document.getElementById("employees");
    const cleanupRadios = document.querySelectorAll("input[name='cleanup']");
    const currentMethod = document.getElementById("current-method").value;
    const monthsBehindInput = document.getElementById("months-behind");

    // ---- CONFIGURABLE PRICING CONSTANTS ----
    const BASE_AMOUNT = 200; // base monthly support
    const PAYROLL_PER_EMPLOYEE = 20; // $ per employee per month

    // Transaction pricing bands (by selectedIndex, not option value)
    const TX_PRICING = [
      150, // 0–50
      225, // 51–150
      325, // 151–300
      450, // 301–600
      600, // 600+
    ];

    // Cleanup multipliers (per month behind)
    const CLEANUP_LOW_MULTIPLIER = 0.7;
    const CLEANUP_HIGH_MULTIPLIER = 1.1;

    // ---- TRANSACTION BAND ----
    const txBandIndex = txSelect ? txSelect.selectedIndex : 0;
    const txAmount = TX_PRICING[txBandIndex] || 0;

    // ---- PAYROLL ----
    const employeesRaw = Number(employeesInput?.value || 0);
    const employees = Math.max(0, Math.min(250, employeesRaw));
    const payrollAmount = employees * PAYROLL_PER_EMPLOYEE;

    // ---- CLEANUP TOGGLE + MONTHS BEHIND ----
    let cleanupValue = "no";
    cleanupRadios.forEach((r) => {
      if (r.checked) cleanupValue = r.value;
    });

    const wantsCleanup = cleanupValue === "yes";

    let monthsBehind = 0;
    if (monthsBehindInput) {
      if (wantsCleanup) {
        const rawMonths = Number(monthsBehindInput.value || 0);
        monthsBehind = Math.max(0, Math.min(36, rawMonths));
        monthsBehindInput.disabled = false;
      } else {
        monthsBehindInput.disabled = true;
        monthsBehindInput.value = "0";
      }
    }

    // ---- MONTHLY ESTIMATE ----
    const lowMonthly = BASE_AMOUNT + txAmount + payrollAmount;
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
