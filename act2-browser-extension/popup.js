function generateFakeTOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function updateCode() {
  const codeEl = document.getElementById("code");
  const code = generateFakeTOTP();
  codeEl.textContent = code.slice(0, 3) + " " + code.slice(3);
}

updateCode();
setInterval(updateCode, 30000);

document.getElementById("copyBtn").addEventListener("click", () => {
  const code = document.getElementById("code").textContent.replace(/\s/g, "");
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById("copyBtn");
    btn.textContent = "Copied!";
    setTimeout(() => {
      btn.textContent = "Copy Code";
    }, 1500);
  });
});
