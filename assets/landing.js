"use strict";
const $ = (id) => document.getElementById(id);
const SERVER = (window.SYNTRA_SERVER || "").replace(/\/$/, "");

// count the visit on the program server (no personal data is sent)
try { fetch(SERVER + "/api/visit", { method: "POST", mode: "cors", keepalive: true }).catch(() => {}); } catch (_) { /* ignore */ }

function openSuggest() {
  $("suggest").classList.remove("hidden");
  $("sMsg").textContent = "";
  $("sMsg").className = "msg";
  ($("sEmail").value ? $("sText") : $("sEmail")).focus();
}
function closeSuggest() { $("suggest").classList.add("hidden"); }

document.querySelectorAll("[data-open-suggest]").forEach((b) => b.addEventListener("click", openSuggest));
$("sClose").addEventListener("click", closeSuggest);
$("suggest").addEventListener("click", (e) => { if (e.target === $("suggest")) closeSuggest(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSuggest(); });
$("sText").addEventListener("input", () => { $("sCount").textContent = `${$("sText").value.length} / 2000`; });

$("sForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = $("sMsg");
  const email = $("sEmail").value.trim();
  const text = $("sText").value.trim();
  if (!/^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$/.test(email)) { msg.className = "msg bad"; msg.textContent = "Please enter a valid e-mail address."; $("sEmail").focus(); return; }
  if (text.length < 5) { msg.className = "msg bad"; msg.textContent = "Please write your suggestion."; $("sText").focus(); return; }
  $("sSend").disabled = true;
  msg.className = "msg"; msg.textContent = "Sending ...";
  try {
    const r = await fetch(SERVER + "/api/suggestions", {
      method: "POST", headers: { "Content-Type": "application/json" }, cache: "no-store",
      body: JSON.stringify({ name: $("sName").value.trim(), email, text, website: $("sWebsite").value }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || "Could not send. Please try again.");
    msg.className = "msg ok";
    msg.textContent = "Thank you! Your suggestion was sent.";
    $("sText").value = "";
    $("sCount").textContent = "0 / 2000";
    setTimeout(closeSuggest, 2200);
  } catch (err) {
    msg.className = "msg bad";
    msg.textContent = err instanceof TypeError
      ? "The server is starting up. Please wait a few seconds and press Send again."
      : err.message;
  } finally {
    $("sSend").disabled = false;
  }
});
