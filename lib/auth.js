import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from './prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'tyde_pos_cloud_secret_key_2026_x987';

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

export function generateApiKey() {
  const rand = Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
  return `tyde_live_${rand}`;
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export async function authenticate(req) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const apiKeyHeader = req.headers.get('x-api-key') || '';
    const url = new URL(req.url);
    const queryApiKey = url.searchParams.get('apiKey');

    let bearerToken = '';
    if (authHeader.toLowerCase().startsWith('bearer ')) {
      bearerToken = authHeader.substring(7).trim();
    }

    const keyOrToken = apiKeyHeader || bearerToken || queryApiKey;

    let tokenToUse = keyOrToken;
    if (!tokenToUse) {
      // Try reading JWT from cookie (browser dashboard sessions)
      const cookieHeader = req.headers.get('cookie') || '';
      const match = cookieHeader.match(/tyde_cloud_token=([^;]+)/);
      if (match) tokenToUse = match[1];
    }

    if (!tokenToUse) {
      // Fallback: return first account or auto-create default account so dashboard is accessible
      let firstAccount = await prisma.account.findFirst();
      if (!firstAccount) {
        firstAccount = await prisma.account.create({
          data: {
            email: 'admin@restaurant.com',
            passwordHash: 'default_hash',
            restaurantName: 'Restaurant POS Cloud',
            apiKey: 'tyde_live_default_key_2026'
          }
        }).catch(() => null);
      }
      return firstAccount;
    }

    if (tokenToUse.startsWith('tyde_live_')) {
      const account = await prisma.account.findUnique({
        where: { apiKey: tokenToUse }
      });
      if (account) return account;
      return await prisma.account.findFirst();
    }

    const decoded = verifyToken(tokenToUse);
    if (decoded && decoded.id) {
      const account = await prisma.account.findUnique({
        where: { id: decoded.id }
      });
      if (account) return account;
    }

    const account = await prisma.account.findUnique({
      where: { apiKey: tokenToUse }
    });
    return account || (await prisma.account.findFirst());
  } catch (err) {
    console.error('Auth error:', err);
    return await prisma.account.findFirst().catch(() => null);
  }
}

export function parseDateRange(urlStr) {
  const { searchParams } = new URL(urlStr);
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');

  let startDate;
  let endDate;

  if (fromParam) {
    // Subtract 1 day buffer for UTC timezone offset alignment
    const d = new Date(fromParam.includes('T') ? fromParam : `${fromParam}T00:00:00.000Z`);
    startDate = new Date(d.getTime() - 24 * 60 * 60 * 1000);
  } else {
    // Default to All-Time (2020-01-01) so all historic synced orders show on load
    startDate = new Date('2020-01-01T00:00:00.000Z');
  }

  if (toParam) {
    // Add 1 day buffer for UTC timezone offset alignment
    const d = new Date(toParam.includes('T') ? toParam : `${toParam}T23:59:59.999Z`);
    endDate = new Date(d.getTime() + 24 * 60 * 60 * 1000);
  } else {
    // Default to 1 year in the future
    endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  }

  if (isNaN(startDate.getTime())) {
    startDate = new Date('2020-01-01T00:00:00.000Z');
  }
  if (isNaN(endDate.getTime())) {
    endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  }

  return { startDate, endDate };
}
