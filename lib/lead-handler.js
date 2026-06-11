function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function sanitizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatLeadTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value || "не вказано";
  }

  return new Intl.DateTimeFormat("uk-UA", {
    timeZone: "Europe/Kiev",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function normalizePhoneLink(value) {
  const digits = String(value || "").replace(/[^\d+]/g, "");
  return digits || value || "-";
}

function formatTelegramMessage(lead) {
  const source = lead.utm_source || lead.utm_campaign || "прямий перехід";
  const phone = escapeHtml(lead.phone || "-");
  const phoneLink = escapeHtml(normalizePhoneLink(lead.phone));
  const name = escapeHtml(lead.name || "-");
  const type = escapeHtml(lead.type || "форма");
  const time = escapeHtml(formatLeadTime(lead.request_time));
  const page = escapeHtml(lead.page || "-");
  const showSource = source && source !== "direct / unknown";

  return [
    "<b>🦷 Нова заявка з сайту</b>",
    "",
    `<b>Ім'я:</b> ${name}`,
    `<b>Телефон:</b> <a href="tel:${phoneLink}">${phone}</a>`,
    `<b>Тип:</b> ${type}`,
    `<b>Час:</b> ${time}`,
    ...(showSource ? [`<b>Джерело:</b> ${escapeHtml(source)}`] : []),
    `<b>Сторінка:</b> ${page}`,
  ].join("\n");
}

function getRecipientChatIds() {
  const envChatIds = [
    ...String(process.env.TELEGRAM_CHAT_ID || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
    ...String(process.env.TELEGRAM_CHAT_IDS || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  ];

  return [...new Set(envChatIds)];
}

async function parseRequestBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string") {
    return JSON.parse(req.body || "{}");
  }

  let rawBody = "";
  for await (const chunk of req) {
    rawBody += chunk;
    if (rawBody.length > 1_000_000) {
      throw new Error("payload_too_large");
    }
  }

  return JSON.parse(rawBody || "{}");
}

async function callTelegram(token, method, payload) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`telegram_failed:${response.status}:${body}`);
  }

  return response.json();
}

async function sendTelegram(lead) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = getRecipientChatIds();

  if (!token) {
    return { skipped: true, reason: "telegram_token_not_configured" };
  }

  if (chatIds.length === 0) {
    return { skipped: true, reason: "telegram_recipients_not_configured" };
  }

  const results = [];
  for (const chatId of chatIds) {
    const result = await callTelegram(token, "sendMessage", {
      chat_id: chatId,
      text: formatTelegramMessage(lead),
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
    results.push({ chatId, ok: true, result });
  }

  return { ok: true, recipients: chatIds.length, results };
}

async function handleLeadRequest(req, res) {
  if (req.method !== "POST") {
    return sendJson(res, 405, { ok: false, error: "method_not_allowed" });
  }

  try {
    const body = await parseRequestBody(req);
    const createdAt = sanitizeText(body.request_time) || new Date().toISOString();
    const lead = {
      name: sanitizeText(body.name),
      phone: sanitizeText(body.phone),
      company: sanitizeText(body.company),
      source: sanitizeText(body.source) || "landing_form",
      type: sanitizeText(body.type) || "форма",
      page: sanitizeText(body.page),
      utm_source: sanitizeText(body.utm_source),
      utm_campaign: sanitizeText(body.utm_campaign),
      gclid: sanitizeText(body.gclid),
      request_time: createdAt,
      createdAt,
    };

    if (lead.company) {
      return sendJson(res, 400, { ok: false, error: "spam_detected" });
    }

    if (!lead.name || !lead.phone) {
      return sendJson(res, 400, { ok: false, error: "missing_fields" });
    }

    const telegramStatus = await sendTelegram(lead);
    return sendJson(res, 200, { ok: true, telegramStatus });
  } catch (error) {
    return sendJson(res, 500, {
      ok: false,
      error: error?.message === "payload_too_large" ? "payload_too_large" : "server_error",
    });
  }
}

module.exports = {
  handleLeadRequest,
};
