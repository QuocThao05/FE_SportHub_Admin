// src/util/formatters.js
export function formatPhone(phone) {
  return phone.replace(/(\d{3})(\d{3})(\d{3,4})/, "$1 $2 $3");
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("vi-VN");
}
