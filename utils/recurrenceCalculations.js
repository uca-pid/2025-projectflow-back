export function calculateNextDeadline(deadline, recurrenceType) {
  const dateDeadline = new Date(deadline);
  if (recurrenceType === "DAILY") {
    dateDeadline.setDate(dateDeadline.getDate() + 1);
    return dateDeadline;
  }

  if (recurrenceType === "WEEKLY") {
    dateDeadline.setDate(dateDeadline.getDate() + 7);
    return dateDeadline;
  }

  if (recurrenceType === "MONTHLY") {
    dateDeadline.setMonth(dateDeadline.getMonth() + 1);
    return dateDeadline;
  }
}

export function calculateRecurrenceOptions(
  recurrenceType,
  recurrenceExpiresAt,
  recurrences,
) {
  if (recurrenceExpiresAt) {
    return {
      recurrenceType,
      recurrenceExpiresAt,
      recurrences,
    };
  }

  return {
    recurrenceType,
    recurrenceExpiresAt: null,
    recurrences: recurrences - 1,
  };
}
