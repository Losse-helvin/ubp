/* Vérification des mobiles français par SMS — Ubepro */
(() => {
  "use strict";

  const API_URL = "https://mc.hellolead.pro/mon_compte/api/smspartner/envoi_code_verification.php";
  const PHONE_RE = /^0[67]\d{8}$/;
  const CODE_RE = /^\d{6}$/;
  const form = document.querySelector("#study-form");
  if (!form) return;

  const phoneInput = form.querySelector('input[name="telephone"]');
  const sendButton = form.querySelector("#send-sms-code");
  const codePanel = form.querySelector("#sms-code-panel");
  const codeInput = form.querySelector("#sms-code");
  const verifyButton = form.querySelector("#verify-sms-code");
  const consentInput = form.querySelector("#phone-contact-consent");
  const feedback = form.querySelector("#sms-feedback");
  const countdown = form.querySelector("#sms-countdown");
  const gateHint = form.querySelector("#verification-gate-hint");
  const submitButton = form.querySelector('button[type="submit"]');

  if (!phoneInput || !sendButton || !codePanel || !codeInput || !verifyButton || !consentInput || !submitButton) return;

  // Exposed only to the existing lead-form script so it can enforce the same gate.
  window.__UBE_PHONE_READY = false;
  window.__UBE_PHONE_VERIFIED = false;
  window.__UBE_PHONE_CONSENT = false;
  window.__UBE_PHONE_SUBMITTING = false;

  const cooldowns = new Map();
  const verifiedPhones = new Set();
  const requestedPhones = new Set();
  let sendBusy = false;
  let verifyBusy = false;
  let timerId = null;
  let lastPhone = phoneDigits();

  function phoneDigits() {
    return String(phoneInput.value || "").replace(/\D/g, "");
  }

  function phoneIsValid(phone = phoneDigits()) {
    return PHONE_RE.test(phone);
  }

  function formatDuration(totalSeconds) {
    const seconds = Math.max(0, Math.ceil(totalSeconds));
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  }

  function setFeedback(message, state = "info") {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.hidden = !message;
    feedback.dataset.state = state;
    feedback.setAttribute("role", state === "error" ? "alert" : "status");
    feedback.setAttribute("aria-live", state === "error" ? "assertive" : "polite");
  }

  function remainingFor(phone) {
    const cooldown = cooldowns.get(phone);
    if (!cooldown) return 0;
    const remaining = Math.ceil((cooldown.until - Date.now()) / 1000);
    if (remaining <= 0) {
      cooldowns.delete(phone);
      return 0;
    }
    return remaining;
  }

  function syncSubmitGate() {
    const phone = phoneDigits();
    const verified = phoneIsValid(phone) && verifiedPhones.has(phone);
    const accepted = consentInput.checked;
    const ready = verified && accepted;
    const busy = window.__UBE_PHONE_SUBMITTING === true || submitButton.getAttribute("aria-busy") === "true";

    window.__UBE_PHONE_VERIFIED = verified;
    window.__UBE_PHONE_CONSENT = accepted;
    window.__UBE_PHONE_READY = ready;
    submitButton.disabled = !ready || busy;

    if (gateHint) {
      if (ready) {
        gateHint.textContent = "Numéro vérifié et accord donné : vous pouvez envoyer votre demande.";
        gateHint.dataset.state = "ready";
      } else if (verified) {
        gateHint.textContent = "Cochez « J’accepte » pour activer la demande.";
        gateHint.dataset.state = "waiting";
      } else if (accepted) {
        gateHint.textContent = "Vérifiez votre numéro par SMS pour activer la demande.";
        gateHint.dataset.state = "waiting";
      } else {
        gateHint.textContent = "Vérifiez votre numéro par SMS et cochez « J’accepte » pour activer la demande.";
        gateHint.dataset.state = "waiting";
      }
    }
  }

  function syncControls() {
    const phone = phoneDigits();
    const validPhone = phoneIsValid(phone);
    const verified = validPhone && verifiedPhones.has(phone);
    const hasCode = validPhone && requestedPhones.has(phone) && !verified;
    const remaining = validPhone ? remainingFor(phone) : 0;
    const cooldown = validPhone ? cooldowns.get(phone) : null;

    codePanel.hidden = !hasCode;
    verifyButton.disabled = !hasCode || verifyBusy || sendBusy || !CODE_RE.test(codeInput.value);

    if (sendBusy) {
      sendButton.textContent = "Envoi du code…";
    } else if (verified) {
      sendButton.textContent = "Numéro vérifié ✓";
    } else if (remaining > 0) {
      sendButton.textContent = `Renvoyer dans ${formatDuration(remaining)}`;
    } else {
      sendButton.textContent = requestedPhones.has(phone) ? "Renvoyer le code" : "Recevoir le code";
    }
    sendButton.disabled = !validPhone || verified || sendBusy || verifyBusy || remaining > 0;

    if (countdown) {
      if (remaining > 0 && cooldown) {
        countdown.hidden = false;
        countdown.textContent = cooldown.source === "server"
          ? `Délai restant indiqué par le serveur : ${formatDuration(remaining)}.`
          : `Vous pourrez demander un nouveau code dans ${formatDuration(remaining)}.`;
      } else {
        countdown.hidden = true;
        countdown.textContent = "";
      }
    }

    syncSubmitGate();
  }

  function tickCooldowns() {
    const now = Date.now();
    for (const [phone, cooldown] of cooldowns) {
      if (cooldown.until <= now) cooldowns.delete(phone);
    }
    syncControls();
    if (cooldowns.size === 0 && timerId !== null) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  function startCooldown(phone, seconds, source = "send") {
    const duration = Math.max(0, Math.ceil(Number(seconds) || 0));
    if (!phone || duration <= 0) {
      syncControls();
      return;
    }
    cooldowns.set(phone, { until: Date.now() + duration * 1000, source });
    if (timerId === null) timerId = window.setInterval(tickCooldowns, 1000);
    syncControls();
  }

  function firstMessage(payload) {
    if (!payload || typeof payload !== "object") return "";
    const sources = [payload, payload.data, payload.result, payload.response];
    for (const source of sources) {
      if (!source || typeof source !== "object") continue;
      for (const key of ["message", "msg", "detail", "error_description", "erreur", "error"]) {
        const value = source[key];
        if (typeof value === "string" && value.trim()) return value.trim();
        if (value && typeof value === "object" && typeof value.message === "string" && value.message.trim()) {
          return value.message.trim();
        }
      }
    }
    return "";
  }

  function parseDelayValue(value, key = "") {
    if (value === null || value === undefined || value === "") return null;
    if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
      return key.toLowerCase().includes("ms") ? Math.ceil(value / 1000) : Math.ceil(value);
    }
    const text = String(value).trim();
    if (/^\d+(?:\.\d+)?$/.test(text)) {
      const number = Number(text);
      return key.toLowerCase().includes("ms") ? Math.ceil(number / 1000) : Math.ceil(number);
    }
    const clock = text.match(/^(\d{1,3}):(\d{2})$/);
    if (clock) return Number(clock[1]) * 60 + Number(clock[2]);
    const seconds = text.match(/(\d+(?:\.\d+)?)\s*(?:s|sec(?:ond(?:e)?s?)?)\b/i);
    const minutes = text.match(/(\d+(?:\.\d+)?)\s*(?:min(?:ute)?s?)\b/i);
    if (minutes && seconds) return Math.ceil(Number(minutes[1]) * 60 + Number(seconds[1]));
    if (seconds) return Math.ceil(Number(seconds[1]));
    if (minutes) return Math.ceil(Number(minutes[1]) * 60);
    return null;
  }

  function getRetryDelay(payload, response) {
    const keys = [
      "retry_after", "retry_after_seconds", "retry_after_sec", "retry_after_ms",
      "retryAfter", "retryAfterSeconds", "retry_in_seconds", "retry_seconds", "remaining", "remaining_seconds", "remainingSeconds",
      "remaining_time", "remaining_delay", "seconds_remaining", "cooldown", "cooldown_seconds", "cooldown_remaining",
      "wait", "wait_seconds", "wait_time", "wait_time_seconds", "seconds",
      "delai", "delai_restant", "delai_restant_seconds", "delai_restant_ms", "temps_restant",
      "temps_restant_secondes", "secondes_restantes", "attente", "attente_secondes", "duree_attente", "retry_in"
    ];
    const sources = [payload, payload?.data, payload?.result, payload?.meta];
    for (const source of sources) {
      if (!source || typeof source !== "object") continue;
      for (const key of keys) {
        if (source[key] !== undefined) {
          const parsed = parseDelayValue(source[key], key);
          if (parsed !== null) return parsed;
        }
      }
    }

    const header = response?.headers?.get("Retry-After");
    if (header) {
      const parsed = parseDelayValue(header, "retry-after");
      if (parsed !== null) return parsed;
      const date = Date.parse(header);
      if (Number.isFinite(date)) return Math.max(0, Math.ceil((date - Date.now()) / 1000));
    }

    const message = firstMessage(payload);
    return parseDelayValue(message);
  }

  function fallbackMessage(status, action) {
    if (status === 422) {
      return action === "envoyer_code"
        ? "Saisissez un numéro mobile français valide de 10 chiffres, commençant par 06 ou 07."
        : "Le numéro ou le code saisi est invalide. Vérifiez les 6 chiffres reçus par SMS.";
    }
    if (status === 404) return "Aucun code n’a été envoyé à ce numéro. Demandez d’abord un code par SMS.";
    if (status === 410) return "Ce code a expiré. Demandez un nouveau code par SMS.";
    if (status === 409) return "Ce code a déjà été utilisé. Demandez un nouveau code par SMS.";
    if (status === 429) return "Une nouvelle demande est trop rapide. Patientez le délai indiqué avant de renvoyer le code.";
    if (status === 502) return "L’envoi du SMS a échoué. Vérifiez le numéro puis réessayez.";
    return "Le service de vérification SMS n’a pas pu traiter la demande. Réessayez.";
  }

  async function postVerification(action, telephone, code) {
    const body = new URLSearchParams();
    body.set("action", action);
    body.set("telephone", telephone);
    if (code !== undefined) body.set("code", code);

    const response = await fetch(API_URL, {
      method: "POST",
      mode: "cors",
      cache: "no-store",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body
    });

    // Read and parse the body regardless of response.ok, including 4xx/5xx replies.
    let raw = "";
    try {
      raw = await response.text();
    } catch (_) {
      raw = "";
    }
    let payload = null;
    try {
      payload = raw ? JSON.parse(raw) : null;
    } catch (_) {
      payload = null;
    }

    const apiMessage = firstMessage(payload);
    const bodyStatus = String(payload?.status || "").toLowerCase();
    const bodySaysFailure = payload?.success === false || payload?.ok === false ||
      ["error", "erreur", "failed", "failure", "ko", "echec", "échec"].includes(bodyStatus);

    if (!response.ok || bodySaysFailure) {
      const error = new Error(apiMessage || fallbackMessage(response.status, action));
      error.status = response.status;
      error.payload = payload;
      error.retryAfterSeconds = response.status === 429 ? getRetryDelay(payload, response) : null;
      throw error;
    }

    return { payload, message: apiMessage };
  }

  function handlePhoneChange() {
    const phone = phoneDigits();
    if (phone !== lastPhone) {
      lastPhone = phone;
      codeInput.value = "";
      codeInput.removeAttribute("aria-invalid");
      if (verifiedPhones.has(phone)) {
        setFeedback("Numéro vérifié avec succès.", "success");
      } else if (requestedPhones.has(phone)) {
        setFeedback("Un code a été envoyé à ce numéro. Saisissez les 6 chiffres reçus.", "info");
      } else {
        setFeedback("", "info");
      }
    }
    syncControls();
  }

  phoneInput.addEventListener("input", handlePhoneChange);
  phoneInput.addEventListener("change", handlePhoneChange);
  consentInput.addEventListener("change", syncControls);

  codeInput.addEventListener("input", () => {
    codeInput.value = String(codeInput.value || "").replace(/\D/g, "").slice(0, 6);
    codeInput.removeAttribute("aria-invalid");
    syncControls();
  });

  sendButton.addEventListener("click", async () => {
    const telephone = phoneDigits();
    if (!phoneIsValid(telephone)) {
      setFeedback("Saisissez un numéro mobile français de 10 chiffres commençant par 06 ou 07.", "error");
      phoneInput.focus();
      return;
    }
    if (verifiedPhones.has(telephone) || sendBusy || verifyBusy || remainingFor(telephone) > 0) return;

    const requestStartedAt = Date.now();
    sendBusy = true;
    codeInput.value = "";
    codeInput.removeAttribute("aria-invalid");
    setFeedback("Envoi du code SMS en cours…", "info");
    syncControls();

    try {
      const result = await postVerification("envoyer_code", telephone);
      requestedPhones.add(telephone);
      if (phoneDigits() === telephone) {
        setFeedback(result.message || "Code envoyé par SMS. Saisissez les 6 chiffres reçus.", "success");
      }
      const elapsed = Math.floor((Date.now() - requestStartedAt) / 1000);
      startCooldown(telephone, Math.max(0, 120 - elapsed), "send");
    } catch (error) {
      if (error.status === 429) {
        // The server is authoritative. Use its returned delay; fall back to the known 120s window.
        const serverDelay = Number.isFinite(error.retryAfterSeconds) ? error.retryAfterSeconds : 120;
        startCooldown(telephone, serverDelay, "server");
      }
      if (phoneDigits() === telephone) {
        const message = error.message || fallbackMessage(error.status, "envoyer_code");
        setFeedback(message, "error");
      }
    } finally {
      sendBusy = false;
      syncControls();
    }
  });

  verifyButton.addEventListener("click", async () => {
    const telephone = phoneDigits();
    const code = String(codeInput.value || "").trim();
    if (!phoneIsValid(telephone)) {
      setFeedback("Saisissez un numéro mobile français valide de 10 chiffres, commençant par 06 ou 07.", "error");
      phoneInput.focus();
      return;
    }
    if (!requestedPhones.has(telephone)) {
      setFeedback("Aucun code n’a été envoyé à ce numéro. Demandez d’abord un code par SMS.", "error");
      return;
    }
    if (!CODE_RE.test(code)) {
      codeInput.setAttribute("aria-invalid", "true");
      setFeedback("Le code reçu doit comporter exactement 6 chiffres.", "error");
      codeInput.focus();
      return;
    }
    if (verifyBusy || sendBusy) return;

    verifyBusy = true;
    setFeedback("Vérification du code en cours…", "info");
    syncControls();

    try {
      const result = await postVerification("verifier_code", telephone, code);
      verifiedPhones.add(telephone);
      codeInput.value = "";
      codeInput.removeAttribute("aria-invalid");
      if (phoneDigits() === telephone) {
        const extra = result.message && !/num[eé]ro.{0,12}v[eé]rifi[eé]/i.test(result.message)
          ? ` ${result.message}`
          : "";
        setFeedback(`Numéro vérifié avec succès.${extra}`, "success");
      }
    } catch (error) {
      if (error.status === 404 || error.status === 409) requestedPhones.delete(telephone);
      if (phoneDigits() === telephone) {
        if (error.status === 422) codeInput.setAttribute("aria-invalid", "true");
        setFeedback(error.message || fallbackMessage(error.status, "verifier_code"), "error");
      }
    } finally {
      verifyBusy = false;
      syncControls();
    }
  });

  syncControls();
})();
