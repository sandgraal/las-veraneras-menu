"use strict";

const fs = require("fs");
const path = require("path");
const http = require("http");
const crypto = require("crypto");

loadEnvFile(path.join(__dirname, ".env"));
loadEnvFile(path.join(__dirname, "..", ".env"));

const PORT = Number(process.env.PORT || 8787);
const SESSION_COOKIE_NAME = "lv_admin_session";
const IMAGE_NAME_RE = /^[a-z0-9][a-z0-9._-]*$/i;
const IMAGE_PATH_RE = /^images\/[a-z0-9._-]+$/i;
const IMAGE_FILE_RE = /\.(jpe?g|png|webp|gif|svg|heic)$/i;

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function config() {
  return {
    password: process.env.LV_ADMIN_PASSWORD || "",
    passwordHash: process.env.LV_ADMIN_PASSWORD_HASH || "",
    sessionSecret: process.env.LV_ADMIN_SESSION_SECRET || "",
    sessionTtlHours: Number(process.env.LV_ADMIN_SESSION_TTL_HOURS || 720),
    allowedOrigins: String(process.env.LV_ADMIN_ALLOWED_ORIGIN || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    anthropicApiKey: process.env.LV_ANTHROPIC_API_KEY || "",
    translateModel: process.env.LV_TRANSLATE_MODEL || "claude-haiku-4-5",
    githubToken: process.env.LV_GITHUB_TOKEN || "",
    owner: process.env.LV_GITHUB_OWNER || "",
    repo: process.env.LV_GITHUB_REPO || "",
    branch: process.env.LV_GITHUB_BRANCH || "main",
    publicSiteBase: String(process.env.LV_PUBLIC_SITE_BASE || "").replace(
      /\/+$/,
      "",
    ),
  };
}

function safeEqual(a, b) {
  const aBuf = Buffer.from(String(a || ""));
  const bBuf = Buffer.from(String(b || ""));
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function verifyScryptHash(password, encoded) {
  const [scheme, saltB64, hashB64] = String(encoded || "").split("$");
  if (scheme !== "scrypt" || !saltB64 || !hashB64) return false;
  const derived = crypto
    .scryptSync(password, Buffer.from(saltB64, "base64"), 64)
    .toString("base64");
  return safeEqual(derived, hashB64);
}

function verifyPassword(password) {
  const cfg = config();
  if (cfg.passwordHash) return verifyScryptHash(password, cfg.passwordHash);
  if (!cfg.password) throw new Error("LV_ADMIN_PASSWORD no está configurada.");
  return safeEqual(password, cfg.password);
}

function requireServerConfig() {
  const cfg = config();
  if (!cfg.sessionSecret) {
    throw new Error("LV_ADMIN_SESSION_SECRET no está configurada.");
  }
  if (!cfg.githubToken) {
    throw new Error("LV_GITHUB_TOKEN no está configurado.");
  }
  if (!cfg.owner || !cfg.repo) {
    throw new Error("LV_GITHUB_OWNER y LV_GITHUB_REPO son obligatorios.");
  }
  if (!cfg.password && !cfg.passwordHash) {
    throw new Error(
      "Debes configurar LV_ADMIN_PASSWORD o LV_ADMIN_PASSWORD_HASH.",
    );
  }
  return cfg;
}

function shouldUseSecureCookies(req) {
  const origin = String(req.headers.origin || "");
  const forwardedProto = String(req.headers["x-forwarded-proto"] || "");
  return origin.startsWith("https://") || forwardedProto.includes("https");
}

function makeCookie(req, value, maxAgeSeconds) {
  const parts = [
    `${SESSION_COOKIE_NAME}=${value}`,
    "Path=/",
    "HttpOnly",
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (shouldUseSecureCookies(req)) {
    parts.push("SameSite=None", "Secure");
  } else {
    parts.push("SameSite=Lax");
  }
  return parts.join("; ");
}

function clearCookie(req) {
  const parts = [`${SESSION_COOKIE_NAME}=`, "Path=/", "HttpOnly", "Max-Age=0"];
  if (shouldUseSecureCookies(req)) {
    parts.push("SameSite=None", "Secure");
  } else {
    parts.push("SameSite=Lax");
  }
  return parts.join("; ");
}

function createSessionToken() {
  const cfg = requireServerConfig();
  const now = Date.now();
  const payload = {
    sub: "admin",
    user: "Las Veraneras Admin",
    iat: now,
    exp: now + cfg.sessionTtlHours * 60 * 60 * 1000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", cfg.sessionSecret)
    .update(body)
    .digest("base64url");
  return `${body}.${sig}`;
}

function verifySessionToken(token) {
  const cfg = requireServerConfig();
  if (!token || !String(token).includes(".")) return null;
  const [body, signature] = String(token).split(".");
  const expected = crypto
    .createHmac("sha256", cfg.sessionSecret)
    .update(body)
    .digest("base64url");
  if (!safeEqual(signature, expected)) return null;
  let payload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (!payload?.exp || payload.exp < Date.now()) return null;
  return payload;
}

function parseCookies(req) {
  const raw = String(req.headers.cookie || "");
  return raw.split(";").reduce((acc, part) => {
    const idx = part.indexOf("=");
    if (idx === -1) return acc;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

function getSession(req) {
  const cookies = parseCookies(req);
  return verifySessionToken(cookies[SESSION_COOKIE_NAME]);
}

function isOriginAllowed(origin) {
  const cfg = config();
  if (!origin) return true;
  if (!cfg.allowedOrigins.length) return false;
  return cfg.allowedOrigins.includes(origin);
}

function applyCors(res, req) {
  const origin = String(req.headers.origin || "");
  if (origin && isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Accept, X-Requested-With",
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
}

function sendJson(res, req, statusCode, payload, extraHeaders = {}) {
  applyCors(res, req);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...extraHeaders,
  });
  res.end(JSON.stringify(payload));
}

function notFound(res, req) {
  sendJson(res, req, 404, { error: "Ruta no encontrada." });
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (e) {
    const err = new Error("Invalid JSON body.");
    err.status = 400;
    throw err;
  }
}

function encodeGitHubPath(filePath) {
  return filePath
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

async function githubFetch(apiPath, options = {}) {
  const cfg = requireServerConfig();
  const url = `https://api.github.com${apiPath}`;
  const headers = {
    Authorization: `Bearer ${cfg.githubToken}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = null;
  }
  if (!res.ok) {
    const err = new Error(
      data?.message || text || `GitHub respondió ${res.status}`,
    );
    err.status = res.status;
    throw err;
  }
  return data;
}

async function getFileSha(filePath) {
  const cfg = requireServerConfig();
  try {
    const data = await githubFetch(
      `/repos/${cfg.owner}/${cfg.repo}/contents/${encodeGitHubPath(filePath)}?ref=${encodeURIComponent(cfg.branch)}`,
    );
    return data?.sha || null;
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
}

async function putTextFile(filePath, content, message) {
  const cfg = requireServerConfig();
  const sha = await getFileSha(filePath);
  return githubFetch(
    `/repos/${cfg.owner}/${cfg.repo}/contents/${encodeGitHubPath(filePath)}`,
    {
      method: "PUT",
      body: {
        message,
        branch: cfg.branch,
        content: Buffer.from(content, "utf8").toString("base64"),
        ...(sha ? { sha } : {}),
      },
    },
  );
}

async function putBase64File(filePath, base64Data, message) {
  const cfg = requireServerConfig();
  const sha = await getFileSha(filePath);
  const content = String(base64Data || "").replace(/\s+/g, "");
  if (!/^[A-Za-z0-9+/=]+$/.test(content)) {
    throw new Error("El archivo recibido no es base64 válido.");
  }
  return githubFetch(
    `/repos/${cfg.owner}/${cfg.repo}/contents/${encodeGitHubPath(filePath)}`,
    {
      method: "PUT",
      body: {
        message,
        branch: cfg.branch,
        content,
        ...(sha ? { sha } : {}),
      },
    },
  );
}

async function deleteFile(filePath, sha, message) {
  const cfg = requireServerConfig();
  return githubFetch(
    `/repos/${cfg.owner}/${cfg.repo}/contents/${encodeGitHubPath(filePath)}`,
    {
      method: "DELETE",
      body: {
        message,
        branch: cfg.branch,
        sha,
      },
    },
  );
}

function buildPublicImageUrl(fileName) {
  const cfg = config();
  if (!cfg.publicSiteBase) return "";
  return `${cfg.publicSiteBase}/images/${encodeURIComponent(fileName)}`;
}

async function listImages() {
  const cfg = requireServerConfig();
  const files = await githubFetch(
    `/repos/${cfg.owner}/${cfg.repo}/contents/images?ref=${encodeURIComponent(cfg.branch)}`,
  );
  const list = Array.isArray(files) ? files : [];
  return list
    .filter((file) => IMAGE_FILE_RE.test(file.name))
    .map((file) => ({
      name: file.name,
      path: `images/${file.name}`,
      sha: file.sha,
      size: file.size,
      publicUrl: buildPublicImageUrl(file.name),
    }));
}

function requireSession(req) {
  const session = getSession(req);
  if (!session) {
    const err = new Error("Sesión expirada o inexistente.");
    err.status = 401;
    throw err;
  }
  return session;
}

function validatePublishPayload(body) {
  if (!body || typeof body !== "object") {
    throw new Error("Payload de publicación inválido.");
  }
  if (!body.menu || typeof body.menu !== "object") {
    throw new Error("Falta menu en la publicación.");
  }
  if (!Array.isArray(body.specials)) {
    throw new Error("Falta specials en la publicación.");
  }
  if (!Array.isArray(body.combos)) {
    throw new Error("Falta combos en la publicación.");
  }
  if (!body.config || typeof body.config !== "object") {
    throw new Error("Falta config en la publicación.");
  }
}

const TRANSLATE_LANGS = {
  es: "Spanish",
  en: "English",
  fr: "French",
};
const TRANSLATE_MAX_CHARS = 4000;

function httpError(message, status) {
  return Object.assign(new Error(message), { status });
}

// Translate a set of menu text fields from one language into one or more
// targets using the Claude API. Input:
//   { source: "es", targets: ["en","fr"], fields: { name, description, story } }
// Output (per target): { en: { name, description, story }, fr: {...} }
async function translateFields(body) {
  const cfg = config();
  if (!cfg.anthropicApiKey) {
    throw httpError(
      "La traducción automática no está configurada (falta LV_ANTHROPIC_API_KEY).",
      503,
    );
  }
  const source = String(body?.source || "").slice(0, 2).toLowerCase();
  if (!TRANSLATE_LANGS[source]) {
    throw httpError("Idioma de origen inválido.", 400);
  }
  const targets = Array.isArray(body?.targets)
    ? [...new Set(body.targets.map((t) => String(t || "").slice(0, 2).toLowerCase()))]
        .filter((t) => TRANSLATE_LANGS[t] && t !== source)
    : [];
  if (!targets.length) {
    throw httpError("No hay idiomas de destino válidos.", 400);
  }
  // Keep only non-empty string fields, capped in length.
  const fields = {};
  for (const [k, v] of Object.entries(body?.fields || {})) {
    if (typeof v === "string" && v.trim()) {
      fields[k] = v.slice(0, TRANSLATE_MAX_CHARS);
    }
  }
  const fieldNames = Object.keys(fields);
  if (!fieldNames.length) {
    throw httpError("No hay texto para traducir.", 400);
  }

  // Build a strict JSON schema so the model returns exactly the shape we expect.
  const fieldProps = {};
  for (const f of fieldNames) fieldProps[f] = { type: "string" };
  const langSchema = {
    type: "object",
    additionalProperties: false,
    properties: fieldProps,
    required: fieldNames,
  };
  const schemaProps = {};
  for (const t of targets) schemaProps[t] = langSchema;
  const schema = {
    type: "object",
    additionalProperties: false,
    properties: schemaProps,
    required: targets,
  };

  const system =
    "You are a professional menu translator for Las Veraneras, a French-Costa Rican " +
    "bistro in Tucurrique, Costa Rica. Translate restaurant menu text faithfully and " +
    "appetizingly. Keep the tone warm and concise. Preserve proper dish names and " +
    "brand names where a translation would be unnatural. Do not add commentary, notes, " +
    "or extra fields. Return only the requested translations.";

  const targetNames = targets.map((t) => TRANSLATE_LANGS[t]).join(" and ");
  const userText =
    `Source language: ${TRANSLATE_LANGS[source]}.\n` +
    `Translate the following menu fields into ${targetNames}.\n` +
    `Return one object per target language keyed by its ISO code (${targets.join(", ")}), ` +
    `each containing the same fields.\n\n` +
    `Fields (JSON):\n${JSON.stringify(fields, null, 2)}`;

  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeoutId = controller
    ? setTimeout(() => controller.abort(), 20000)
    : null;
  let resp;
  try {
    resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": cfg.anthropicApiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      signal: controller?.signal,
      body: JSON.stringify({
        model: cfg.translateModel,
        max_tokens: 2048,
        system,
        output_config: { format: { type: "json_schema", schema } },
        messages: [{ role: "user", content: userText }],
      }),
    });
  } catch (e) {
    throw httpError(
      e?.name === "AbortError"
        ? "El servicio de traducción tardó demasiado en responder."
        : "No se pudo contactar el servicio de traducción.",
      502,
    );
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }

  const payload = await resp.json().catch(() => null);
  if (!resp.ok) {
    const msg = payload?.error?.message || `La API respondió con ${resp.status}`;
    // Surface auth/config issues as 503, everything else as 502.
    throw httpError(`Traducción falló: ${msg}`, resp.status === 401 ? 503 : 502);
  }
  const text = Array.isArray(payload?.content)
    ? payload.content.find((b) => b.type === "text")?.text
    : null;
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw httpError("La traducción devolvió un formato inesperado.", 502);
  }
  return parsed;
}

const server = http.createServer(async (req, res) => {
  try {
    if (!isOriginAllowed(String(req.headers.origin || ""))) {
      return sendJson(res, req, 403, {
        error: "Origin no permitido por LV_ADMIN_ALLOWED_ORIGIN.",
      });
    }

    if (req.method === "OPTIONS") {
      applyCors(res, req);
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

    if (req.method === "GET" && url.pathname === "/api/health") {
      const cfg = config();
      return sendJson(res, req, 200, {
        ok: true,
        service: "Las Veraneras Admin API",
        repo: cfg.owner && cfg.repo ? `${cfg.owner}/${cfg.repo}` : null,
        branch: cfg.branch,
        hasPassword: Boolean(cfg.password || cfg.passwordHash),
        hasGitHubToken: Boolean(cfg.githubToken),
        loginMode: "password-session",
        publicSiteBase: cfg.publicSiteBase || null,
        serverTime: new Date().toISOString(),
      });
    }

    if (req.method === "GET" && url.pathname === "/api/session") {
      const session = getSession(req);
      // Rolling session: each time the admin loads, slide the expiry forward so
      // an active owner stays logged in instead of re-entering the password.
      const extra = session
        ? {
            "Set-Cookie": makeCookie(
              req,
              createSessionToken(),
              config().sessionTtlHours * 3600,
            ),
          }
        : undefined;
      return sendJson(
        res,
        req,
        200,
        {
          authenticated: Boolean(session),
          user: session?.user || null,
        },
        extra,
      );
    }

    if (req.method === "POST" && url.pathname === "/api/session/login") {
      requireServerConfig();
      const body = await readJsonBody(req);
      if (!body.password || !verifyPassword(body.password)) {
        return sendJson(res, req, 401, {
          error: "Contraseña incorrecta.",
        });
      }
      const token = createSessionToken();
      return sendJson(
        res,
        req,
        200,
        { ok: true, user: "Las Veraneras Admin" },
        {
          "Set-Cookie": makeCookie(req, token, config().sessionTtlHours * 3600),
        },
      );
    }

    if (req.method === "POST" && url.pathname === "/api/session/logout") {
      return sendJson(
        res,
        req,
        200,
        { ok: true },
        { "Set-Cookie": clearCookie(req) },
      );
    }

    if (req.method === "POST" && url.pathname === "/api/translate") {
      requireSession(req);
      const body = await readJsonBody(req);
      const data = await translateFields(body);
      return sendJson(res, req, 200, { translations: data });
    }

    if (req.method === "POST" && url.pathname === "/api/publish") {
      requireSession(req);
      const body = await readJsonBody(req);
      validatePublishPayload(body);
      const ts = new Date().toISOString().slice(0, 16).replace("T", " ");
      await putTextFile(
        "data/menu.json",
        JSON.stringify(body.menu, null, 2),
        `✏️ Admin API: actualizar menú [${ts}]`,
      );
      await putTextFile(
        "data/specials.json",
        JSON.stringify(body.specials, null, 2),
        `✏️ Admin API: actualizar especiales [${ts}]`,
      );
      await putTextFile(
        "data/combos.json",
        JSON.stringify(body.combos, null, 2),
        `✏️ Admin API: actualizar combos [${ts}]`,
      );
      await putTextFile(
        "data/config.json",
        JSON.stringify(body.config, null, 2),
        `✏️ Admin API: actualizar configuración [${ts}]`,
      );
      return sendJson(res, req, 200, {
        ok: true,
        publishedAt: new Date().toISOString(),
      });
    }

    if (req.method === "GET" && url.pathname === "/api/images") {
      requireSession(req);
      const images = await listImages();
      return sendJson(res, req, 200, { ok: true, images });
    }

    if (req.method === "POST" && url.pathname === "/api/images") {
      requireSession(req);
      const body = await readJsonBody(req);
      const filename = String(body.filename || "").trim();
      if (!IMAGE_NAME_RE.test(filename) || !IMAGE_FILE_RE.test(filename)) {
        return sendJson(res, req, 400, {
          error: "Nombre de archivo inválido.",
        });
      }
      if (!body.base64Data) {
        return sendJson(res, req, 400, {
          error: "Falta la imagen base64.",
        });
      }
      const repoPath = `images/${filename}`;
      await putBase64File(
        repoPath,
        body.base64Data,
        `📷 Admin API: subir imagen ${filename}`,
      );
      return sendJson(res, req, 200, {
        ok: true,
        path: repoPath,
        publicUrl: buildPublicImageUrl(filename),
      });
    }

    if (req.method === "DELETE" && url.pathname === "/api/images") {
      requireSession(req);
      const body = await readJsonBody(req);
      const repoPath = String(body.path || "").trim();
      const sha = String(body.sha || "").trim();
      if (!IMAGE_PATH_RE.test(repoPath)) {
        return sendJson(res, req, 400, {
          error: "Ruta de imagen inválida.",
        });
      }
      if (!sha) {
        return sendJson(res, req, 400, { error: "Falta el SHA." });
      }
      await deleteFile(
        repoPath,
        sha,
        `🗑️ Admin API: eliminar imagen ${repoPath}`,
      );
      return sendJson(res, req, 200, { ok: true });
    }

    if (req.method === "GET" && url.pathname === "/api/history") {
      requireSession(req);
      const cfg = requireServerConfig();
      // Returns last 10 commits that touched any of the 4 data files
      const DATA_FILES = [
        "data/menu.json",
        "data/specials.json",
        "data/combos.json",
        "data/config.json",
      ];
      const perFile = await Promise.all(
        DATA_FILES.map((f) =>
          githubFetch(
            `/repos/${cfg.owner}/${cfg.repo}/commits?path=${encodeURIComponent(f)}&sha=${encodeURIComponent(cfg.branch)}&per_page=6`,
          ).catch(() => []),
        ),
      );
      // Merge + dedupe by sha, sort newest first
      const seen = new Set();
      const commits = [];
      perFile.flat().forEach((c) => {
        if (c?.sha && !seen.has(c.sha)) {
          seen.add(c.sha);
          commits.push({
            sha: c.sha,
            message: c.commit?.message || "",
            date: c.commit?.author?.date || "",
            author: c.commit?.author?.name || "",
          });
        }
      });
      commits.sort((a, b) => (a.date < b.date ? 1 : -1));
      return sendJson(res, req, 200, {
        ok: true,
        commits: commits.slice(0, 10),
      });
    }

    if (req.method === "POST" && url.pathname === "/api/rollback") {
      requireSession(req);
      const cfg = requireServerConfig();
      const body = await readJsonBody(req);
      const sha = String(body.sha || "").trim();
      if (!/^[0-9a-f]{7,40}$/.test(sha)) {
        return sendJson(res, req, 400, { error: "SHA inválido." });
      }
      const DATA_FILES = [
        "data/menu.json",
        "data/specials.json",
        "data/combos.json",
        "data/config.json",
      ];
      // Fetch all required files at the given commit and only republish if all exist
      const restored = {};
      const missingFiles = [];
      await Promise.all(
        DATA_FILES.map(async (f) => {
          try {
            const fileData = await githubFetch(
              `/repos/${cfg.owner}/${cfg.repo}/contents/${encodeGitHubPath(f)}?ref=${encodeURIComponent(sha)}`,
            );
            if (!fileData?.content) {
              missingFiles.push(f);
              return;
            }
            const content = Buffer.from(
              fileData.content.replace(/\s/g, ""),
              "base64",
            ).toString("utf8");
            restored[f] = content;
          } catch (e) {
            missingFiles.push(f);
          }
        }),
      );
      if (missingFiles.length) {
        return sendJson(res, req, 404, {
          error:
            "El commit no contiene todos los archivos de datos requeridos para un rollback consistente.",
          missingFiles,
          fromSha: sha,
        });
      }
      const ts = new Date().toISOString().slice(0, 16).replace("T", " ");
      await Promise.all(
        DATA_FILES.map((f) =>
          putTextFile(
            f,
            restored[f],
            `⏪ Admin API: rollback a ${sha.slice(0, 7)} [${ts}]`,
          ),
        ),
      );
      return sendJson(res, req, 200, {
        ok: true,
        restoredFiles: DATA_FILES,
        fromSha: sha,
      });
    }

    return notFound(res, req);
  } catch (error) {
    const status = error.status || 500;
    return sendJson(res, req, status, {
      error:
        status === 500
          ? error.message || "Error interno del Admin API."
          : error.message,
    });
  }
});

server.listen(PORT, () => {
  console.log(`Las Veraneras Admin API listening on http://localhost:${PORT}`);
});
