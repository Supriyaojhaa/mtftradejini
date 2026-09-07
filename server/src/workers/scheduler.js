/**
 * EOD Statutory Ingestion Scheduler
 * Triggers daily MTF reporting ingestion after market hours at 19:00 IST (13:30 UTC) Monday to Friday.
 */

import { runFullDailyIngestion } from "./nseMtfIngestion.js";

let schedulerInitialized = false;

export function initScheduler() {
  if (schedulerInitialized) return;
  schedulerInitialized = true;

  console.log("[Scheduler] Initializing EOD statutory disclosure job...");

  // Interval check every hour to detect 19:00 IST (13:30 UTC) trigger window
  const CHECK_INTERVAL_MS = 60 * 60 * 1000;
  let lastRunDate = null;

  setInterval(async () => {
    try {
      const now = new Date();
      // Calculate IST time (UTC + 5.5 hours)
      const istTime = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
      const dayOfWeek = istTime.getUTCDay(); // 1 = Monday, 5 = Friday
      const hours = istTime.getUTCHours();
      const todayDateStr = istTime.toISOString().split("T")[0];

      // Run on weekdays after 19:00 IST if not already executed today
      if (dayOfWeek >= 1 && dayOfWeek <= 5 && hours >= 19 && lastRunDate !== todayDateStr) {
        console.log(`[Scheduler] 19:00 IST market close window reached. Triggering ingestion for ${todayDateStr}`);
        lastRunDate = todayDateStr;
        await runFullDailyIngestion(todayDateStr);
      }
    } catch (err) {
      console.error("[Scheduler] Scheduled job error:", err.message);
    }
  }, CHECK_INTERVAL_MS);

  console.log("[Scheduler] Scheduled: Mon-Fri at 19:00 IST (13:30 UTC)");
}
