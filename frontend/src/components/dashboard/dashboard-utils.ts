export type DateRangePreset =
  | "last_7_days"
  | "last_30_days"
  | "this_month"
  | "last_month";

export type DateRange = {
  dateFrom: string;
  dateTo: string;
};

export function getDateRangeFromPreset(
  preset: DateRangePreset,
): DateRange {
  const today = new Date();

  const dateTo = new Date(today);
  dateTo.setHours(0, 0, 0, 0);

  const dateFrom = new Date(today);
  dateFrom.setHours(0, 0, 0, 0);

  switch (preset) {
    case "last_7_days":
      dateFrom.setDate(
        dateFrom.getDate() - 6,
      );
      break;

    case "last_30_days":
      dateFrom.setDate(
        dateFrom.getDate() - 29,
      );
      break;

    case "this_month":
      dateFrom.setDate(1);
      break;

    case "last_month":
      dateFrom.setMonth(
        dateFrom.getMonth() - 1,
        1,
      );

      dateTo.setDate(0);
      break;
  }

  return {
    dateFrom: formatDateForApi(dateFrom),
    dateTo: formatDateForApi(dateTo),
  };
}

function formatDateForApi(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}