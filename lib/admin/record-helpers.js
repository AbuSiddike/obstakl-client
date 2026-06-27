export function getPropertyTitle(record) {
  return record.property?.title || record.propertyName || "N/A";
}

export function getPersonName(person) {
  return person?.name || "N/A";
}

export function getBookingStatus(booking) {
  return booking.bookingStatus || booking.status || "Pending";
}

export function getPaymentStatus(booking) {
  return booking.paymentStatus || "N/A";
}

export function getAmount(record) {
  const value = record.amountPaid ?? record.amount;
  return value != null ? value : 0;
}

export function getTransactionId(record) {
  return record.transactionId || record._id || "N/A";
}

export function formatRecordDate(value) {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString();
}

export function getBookingDate(booking) {
  return booking.moveInDate || booking.createdAt;
}
