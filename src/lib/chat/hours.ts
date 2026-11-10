/**
 * Consultant Operating Hours & Botswana Public Holidays Engine
 * Operating hours: 09:00 - 16:00 CAT (Central Africa Time, UTC+2) on business days only.
 */

export interface ConsultingHoursStatus {
  open: boolean;
  currentCatTime: string;
  reason?: string;
  nextOpening?: string;
  isHoliday?: boolean;
  holidayName?: string;
}

/**
 * Standard Botswana Official Public Holidays (Fixed and movable dates for 2026)
 */
export const BOTSWANA_HOLIDAYS_2026: Record<string, string> = {
  "2026-01-01": "New Year's Day",
  "2026-01-02": "Public Holiday",
  "2026-04-03": "Good Friday",
  "2026-04-04": "Holy Saturday",
  "2026-04-06": "Easter Monday",
  "2026-05-01": "Labour Day",
  "2026-05-14": "Ascension Day",
  "2026-07-01": "Sir Seretse Khama Day",
  "2026-07-20": "Presidents' Day",
  "2026-07-21": "Public Holiday",
  "2026-09-30": "Botswana Day (National Day)",
  "2026-10-01": "Public Holiday",
  "2026-12-25": "Christmas Day",
  "2026-12-26": "Boxing Day",
};

/**
 * Checks whether consultant live chat is currently in-session.
 */
export function getConsultingHoursStatus(now = new Date()): ConsultingHoursStatus {
  // Convert current UTC time to CAT (UTC + 2)
  const catOffsetMs = 2 * 60 * 60 * 1000;
  const catDate = new Date(now.getTime() + catOffsetMs);

  const dayOfWeek = catDate.getUTCDay(); // 0 = Sunday, 6 = Saturday
  const hours = catDate.getUTCHours();
  const minutes = catDate.getUTCMinutes();
  const yyyy = catDate.getUTCFullYear();
  const mm = String(catDate.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(catDate.getUTCDate()).padStart(2, "0");
  const dateKey = `${yyyy}-${mm}-${dd}`;

  const currentCatTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} CAT`;

  // Check Botswana public holidays
  const holidayName = BOTSWANA_HOLIDAYS_2026[dateKey];
  if (holidayName) {
    return {
      open: false,
      currentCatTime,
      isHoliday: true,
      holidayName,
      reason: `Closed for Botswana Public Holiday: ${holidayName}`,
      nextOpening: "Next regular business day at 09:00 CAT",
    };
  }

  // Check weekends (Saturday / Sunday)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return {
      open: false,
      currentCatTime,
      reason: "Consultants are available Monday to Friday only.",
      nextOpening: "Monday at 09:00 CAT",
    };
  }

  // Operating window: 09:00 to 16:00 CAT
  if (hours < 9) {
    return {
      open: false,
      currentCatTime,
      reason: "Consulting opens at 09:00 CAT.",
      nextOpening: `Today at 09:00 CAT`,
    };
  }

  if (hours >= 16) {
    return {
      open: false,
      currentCatTime,
      reason: "Consulting closed at 16:00 CAT.",
      nextOpening: "Tomorrow at 09:00 CAT",
    };
  }

  return {
    open: true,
    currentCatTime,
  };
}
