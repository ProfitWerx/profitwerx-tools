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

  // --- Core inputs ---
  const txAmount = Number(txSelect.value) || 0;

  const employees = Math.max(
    0,
    Math.min(250, Number(employeesInput.value) || 0)
  );
  const payrollAmount = employees * 20; // $20 / employee per month as a rough guide

  let cleanupValue = "no";
  cleanupRadios.forEach((r) => {
    if (r.checked) cleanupValue = r.value;
  });

  // Months behind (for separate project estimate)
  let monthsBehind = 0;
  if (monthsBehindInput) {
    monthsBehind = Math.max(
      0,
      Math.min(36, Number(monthsBehindInput.value) || 0)
    );
  }

  // --- Monthly pricing (ongoing support only) ---
  const baseAmount = 200; // base monthly support – keep simple / conservative

  // NOTE: cleanup / catch-up is now handled SEPARATELY (not baked into monthly)
  const monthlyLow = baseAmount + txAmount + payrollAmount;
  const monthlyHigh = monthlyLow + 100; // simple range buffer

  // --- One-time cleanup project estimate ---
  // Only apply if user says they are behind AND monthsBehind > 0
  let cleanupText = "$0";
  let cleanupLow = 0;
  let cleanupHigh = 0;

  if (cleanupValue === "yes" && monthsBehind > 0) {
    // Per-month-behind ranges (tweakable)
    const perMonthLow = 100;  // lower bound per month of cleanup
    const perMonthHigh = 200; // upper bound per month of cleanup

    cleanupLow = monthsBehind * perMonthLow;
    cleanupHigh = monthsBehind * perMonthHigh;

    cleanupText =
      formatCurrency(cleanupLow) +
      " – " +
      formatCurrency(cleanupHigh) +
      " one-time";
  } else if (cleanupValue === "yes" && monthsBehind === 0) {
    cleanupText = "TBD after review (no months specified)";
  } else {
    cleanupText = "$0 (no catch-up work)";
  }

  // --- Update breakdown numbers / text ---
  document.getElementById("base-amount").textContent =
    formatCurrency(baseAmount);
  document.getElementById("tx-amount").textContent = formatCurrency(txAmount);
  document.getElementById("payroll-amount").textContent =
    payrollAmount > 0 ? formatCurrency(payrollAmount) : "$0";
  document.getElementById("cleanup-amount").textContent = cleanupText;

  // --- Update main monthly estimate ---
  document.getElementById("estimate-range").textContent =
    formatCurrency(monthlyLow) + " – " + formatCurrency(monthlyHigh);

  // --- Caption logic (explainer text under the big number) ---
  const captionEl = document.getElementById("estimate-caption");

  let caption = "Typical range for a small Oregon-based business.";

  if (cleanupValue === "yes" && monthsBehind > 0) {
    caption =
      `Monthly range above is for ongoing bookkeeping only. ` +
      `Estimated one-time catch-up project: ${formatCurrency(
        cleanupLow
      )} – ${formatCurrency(cleanupHigh)} for roughly ${monthsBehind} month(s) behind.`;
  } else if (cleanupValue === "yes" && monthsBehind === 0) {
    caption =
      "Monthly range above is for ongoing bookkeeping only. One-time catch-up work would be quoted after reviewing how far behind things are.";
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

// Attach listeners
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

// Optional listener if the months-behind field exists
const monthsBehindInput = document.getElementById("months-behind");
if (monthsBehindInput) {
  monthsBehindInput.addEventListener("input", calculateEstimate);
}

// Initial calc
calculateEstimate();
