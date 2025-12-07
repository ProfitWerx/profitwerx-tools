const transactions = document.getElementById("transactions");
const accounts = document.getElementById("accounts");
const payroll = document.getElementById("payroll");
const estimateEl = document.getElementById("estimate");

function calculate() {
  let total = 150; // base fee

  total += Number(transactions.value);

  const extraAccounts = Math.max(0, accounts.value - 2);
  total += extraAccounts * 25;

  total += Number(payroll.value);

  const low = Math.round(total * 0.9);
  const high = Math.round(total * 1.1);

  estimateEl.textContent = `$${low} – $${high} / month`;
}

document.querySelectorAll("input, select").forEach(el =>
  el.addEventListener("change", calculate)
);

calculate();

