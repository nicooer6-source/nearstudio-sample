const http = require('node:http');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const secret = process.env.INVITE_SECRET;
const code = process.env.INVITE_CODE;
const sampleCode = process.env.SAMPLE_INVITE_CODE;
const sampleVersion = process.env.SAMPLE_INVITE_VERSION || '';
if (!secret || !code || !sampleCode) throw new Error('Invite environment is required');

const ttl = 7 * 86400;
const maxTemporaryTtl = 30 * 86400;
const dataDir = process.env.INVITE_DATA_DIR || '/var/lib/nearstudio-invite';
const invitesFile = path.join(dataDir, 'sample-invites.json');
const apiRoot = '/sample/admin-api';
const sign = value => crypto.createHmac('sha256', secret).update(value).digest('hex');
const signSample = value => sign(`sample:${sampleVersion ? `${sampleVersion}:` : ''}${value}`);
const inviteHash = value => crypto.createHash('sha256').update(`${secret}:sample-invite:${value.trim().toUpperCase()}`).digest('hex');

function signatureMatches(actual = '', expected = '') {
  if (!/^[a-f0-9]{64}$/.test(actual) || !/^[a-f0-9]{64}$/.test(expected)) return false;
  return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

function cookieToken(cookie = '', name) {
  const prefix = `${name}=`;
  return cookie.split(';').map(value => value.trim()).find(value => value.startsWith(prefix))?.slice(prefix.length) || '';
}

function valid(cookie = '', name = 'near_invite', signer = sign) {
  const [expiry, signature] = cookieToken(cookie, name).split('.');
  if (!/^\d+$/.test(expiry) || Number(expiry) <= Date.now() || Number(expiry) > Date.now() + ttl * 1000) return false;
  return signatureMatches(signature, signer(expiry));
}

fs.mkdirSync(dataDir, { recursive: true, mode: 0o750 });
let temporaryInvites = [];
try {
  const stored = JSON.parse(fs.readFileSync(invitesFile, 'utf8'));
  if (Array.isArray(stored)) temporaryInvites = stored;
} catch (error) {
  if (error.code !== 'ENOENT') console.error('Unable to read sample invites:', error);
}

function saveInvites() {
  const cutoff = Date.now() - 30 * 86400 * 1000;
  temporaryInvites = temporaryInvites.filter(invite => invite.expiresAt > cutoff || (!invite.revokedAt && invite.expiresAt > Date.now()));
  const next = `${invitesFile}.next`;
  fs.writeFileSync(next, JSON.stringify(temporaryInvites, null, 2), { mode: 0o600 });
  fs.renameSync(next, invitesFile);
}

function sampleSession(cookie = '') {
  const parts = cookieToken(cookie, 'near_sample_invite').split('.');
  if (parts.length === 2) {
    const [expiry, signature] = parts;
    if (!/^\d+$/.test(expiry) || Number(expiry) <= Date.now() || Number(expiry) > Date.now() + ttl * 1000) return null;
    return signatureMatches(signature, signSample(expiry)) ? { role: 'admin', expiry: Number(expiry) } : null;
  }
  if (parts.length !== 3) return null;
  const [expiry, inviteId, signature] = parts;
  const expiryNumber = Number(expiry);
  if (!/^\d+$/.test(expiry) || !/^[a-f0-9]{16}$/.test(inviteId) || expiryNumber <= Date.now() || expiryNumber > Date.now() + maxTemporaryTtl * 1000) return null;
  if (!signatureMatches(signature, signSample(`${expiry}:${inviteId}`))) return null;
  const invite = temporaryInvites.find(item => item.id === inviteId);
  if (!invite || invite.revokedAt || invite.expiresAt <= Date.now() || expiryNumber > invite.expiresAt) return null;
  return { role: 'guest', expiry: expiryNumber, inviteId };
}

const attempts = new Map();
setInterval(() => {
  for (const [key, value] of attempts) if (value.until < Date.now()) attempts.delete(key);
}, 60000).unref();

const page = fs.readFileSync(__dirname + '/invite.html', 'utf8');
const samplePage = page
  .replace('action="/invite"', 'action="/sample-invite"')
  .replace('打开我的作品世界。', '打开 Nearstudio 组件库。')
  .replace('进入作品集', '进入组件库')
  .replace('<script src="/_entry/form.js" defer></script>', '');

const modes = {
  main: {
    endpoint: '/invite', check: '/_invite_check', code, cookieName: 'near_invite', cookiePath: '/',
    destination: '/', page, signer: sign,
  },
  sample: {
    endpoint: '/sample-invite', check: '/_sample_invite_check', code: sampleCode,
    cookieName: 'near_sample_invite', cookiePath: '/sample', destination: '/sample/', page: samplePage,
    signer: signSample,
  },
};

function safeEqual(value, expected) {
  const a = crypto.createHash('sha256').update(value).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

function isAllowedOrigin(req) {
  const origin = req.headers.origin;
  return !origin || ['https://nearstudio.art', 'https://www.nearstudio.art'].includes(origin);
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 4096) reject(new Error('Payload too large'));
    });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

function publicInvite(invite) {
  return {
    id: invite.id,
    label: invite.label,
    createdAt: invite.createdAt,
    expiresAt: invite.expiresAt,
    revokedAt: invite.revokedAt || null,
    active: !invite.revokedAt && invite.expiresAt > Date.now(),
  };
}

function generatedCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(10);
  const part = offset => Array.from(bytes.subarray(offset, offset + 5), value => alphabet[value % alphabet.length]).join('');
  return `NS-${part(0)}-${part(5)}`;
}

async function handleAdminApi(req, res, requestPath) {
  const session = sampleSession(req.headers.cookie);
  if (requestPath === `${apiRoot}/session` && req.method === 'GET') {
    return sendJson(res, session ? 200 : 401, { admin: session?.role === 'admin' });
  }
  if (!session) return sendJson(res, 401, { error: 'Authentication required' });
  if (session.role !== 'admin') return sendJson(res, 403, { error: 'Admin access required' });

  if (requestPath === `${apiRoot}/invites` && req.method === 'GET') {
    return sendJson(res, 200, { invites: temporaryInvites.slice().sort((a, b) => b.createdAt - a.createdAt).map(publicInvite) });
  }
  if (!isAllowedOrigin(req)) return sendJson(res, 403, { error: 'Invalid origin' });

  if (requestPath === `${apiRoot}/invites` && req.method === 'POST') {
    try {
      const body = await readJson(req);
      const durationMinutes = Number(body.durationMinutes);
      if (!Number.isFinite(durationMinutes) || durationMinutes < 5 || durationMinutes > 43200) {
        return sendJson(res, 400, { error: 'Duration must be between 5 minutes and 30 days' });
      }
      const plainCode = generatedCode();
      const now = Date.now();
      const invite = {
        id: crypto.randomBytes(8).toString('hex'),
        label: String(body.label || '').trim().slice(0, 80),
        codeHash: inviteHash(plainCode),
        createdAt: now,
        expiresAt: now + Math.round(durationMinutes * 60000),
        revokedAt: null,
      };
      temporaryInvites.push(invite);
      saveInvites();
      return sendJson(res, 201, { invite: { ...publicInvite(invite), code: plainCode } });
    } catch {
      return sendJson(res, 400, { error: 'Invalid request' });
    }
  }

  const revokeMatch = requestPath.match(new RegExp(`^${apiRoot}/invites/([a-f0-9]{16})$`));
  if (revokeMatch && req.method === 'DELETE') {
    const invite = temporaryInvites.find(item => item.id === revokeMatch[1]);
    if (!invite) return sendJson(res, 404, { error: 'Invite not found' });
    if (!invite.revokedAt) invite.revokedAt = Date.now();
    saveInvites();
    return sendJson(res, 200, { invite: publicInvite(invite) });
  }

  return sendJson(res, 404, { error: 'Not found' });
}

http.createServer(async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const requestPath = req.url?.split('?')[0] || '';
  if (requestPath.startsWith(`${apiRoot}/`)) return handleAdminApi(req, res, requestPath);

  const mode = Object.values(modes).find(item => item.endpoint === requestPath || item.check === requestPath);
  if (!mode) { res.writeHead(404); return res.end(); }

  if (requestPath === mode.check) {
    const allowed = mode === modes.sample ? Boolean(sampleSession(req.headers.cookie)) : valid(req.headers.cookie, mode.cookieName, mode.signer);
    res.writeHead(allowed ? 204 : 401);
    return res.end();
  }

  if (req.method === 'GET' || req.method === 'HEAD') {
    const allowed = mode === modes.sample ? Boolean(sampleSession(req.headers.cookie)) : valid(req.headers.cookie, mode.cookieName, mode.signer);
    if (allowed) {
      res.writeHead(303, { Location: mode.destination });
      return res.end();
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end(req.method === 'HEAD' ? '' : mode.page.replace('{{ERROR}}', ''));
  }

  if (req.method !== 'POST') { res.writeHead(405); return res.end(); }
  if (!isAllowedOrigin(req)) { res.writeHead(403); return res.end(); }

  const ip = req.headers['x-real-ip'] || req.socket.remoteAddress;
  const attemptKey = `${mode.cookieName}:${ip}`;
  const entry = attempts.get(attemptKey);
  if (entry && entry.until > Date.now() && entry.count >= 15) {
    res.writeHead(429, { 'Content-Type': 'text/html; charset=utf-8', 'Retry-After': '900' });
    return res.end(mode.page.replace('{{ERROR}}', '尝试次数较多，请 15 分钟后再试。'));
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk;
    if (body.length > 1024) req.destroy();
  });
  req.on('end', () => {
    const value = new URLSearchParams(body).get('code') || '';
    let session = null;
    if (safeEqual(value, mode.code)) {
      session = { role: mode === modes.sample ? 'admin' : 'main', expiry: Date.now() + ttl * 1000 };
    } else if (mode === modes.sample) {
      const hash = inviteHash(value);
      const invite = temporaryInvites.find(item => !item.revokedAt && item.expiresAt > Date.now() && signatureMatches(hash, item.codeHash));
      if (invite) session = { role: 'guest', inviteId: invite.id, expiry: invite.expiresAt };
    }

    if (!session) {
      attempts.set(attemptKey, {
        count: entry && entry.until > Date.now() ? entry.count + 1 : 1,
        until: entry && entry.until > Date.now() ? entry.until : Date.now() + 900000,
      });
      res.writeHead(401, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(mode.page.replace('{{ERROR}}', '邀请码不正确或已失效，请重新输入。'));
    }

    attempts.delete(attemptKey);
    const expiry = String(session.expiry);
    const token = session.role === 'guest'
      ? `${expiry}.${session.inviteId}.${signSample(`${expiry}:${session.inviteId}`)}`
      : `${expiry}.${mode.signer(expiry)}`;
    const maxAge = Math.max(1, Math.floor((session.expiry - Date.now()) / 1000));
    const cookie = `${mode.cookieName}=${token}; Path=${mode.cookiePath}; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
    res.writeHead(303, { Location: mode.destination, 'Set-Cookie': cookie });
    res.end();
  });
}).listen(Number(process.env.PORT || 8791), '127.0.0.1');
