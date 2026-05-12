// src/lib/charges.js - PesaYetu Transaction Charges

// Sending charges
export function getSendCharge(amount) {
  if (amount < 150) return 0;
  if (amount <= 500) return 10;
  if (amount <= 1000) return 20;
  if (amount <= 5000) return 50;
  if (amount <= 10000) return 75;
  if (amount <= 50000) return 100;
  if (amount <= 150000) return 200;
  if (amount <= 500000) return 350;
  if (amount <= 1000000) return 500;
  return 500;
}

// Withdrawal charges
export function getWithdrawCharge(amount) {
  if (amount <= 100) return 10;
  if (amount <= 500) return 25;
  if (amount <= 1000) return 35;
  if (amount <= 5000) return 60;
  if (amount <= 10000) return 100;
  if (amount <= 50000) return 150;
  if (amount <= 150000) return 250;
  if (amount <= 500000) return 400;
  if (amount <= 1000000) return 600;
  return 600;
}

// Deposit charges
export function getDepositCharge(amount) {
  return 0; // Free
}

// Format charge display
export function formatCharge(charge) {
  if (charge === 0) return 'FREE';
  return `KES ${charge.toLocaleString()}`;
}
