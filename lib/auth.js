import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from './prisma';

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
      return null;
    }

    if (tokenToUse.startsWith('tyde_live_')) {
      const account = await prisma.account.findUnique({
        where: { apiKey: tokenToUse }
      });
      return account;
    }

    const decoded = verifyToken(tokenToUse);
    if (decoded && decoded.id) {
      const account = await prisma.account.findUnique({
        where: { id: decoded.id }
      });
      return account || decoded;
    }

    const account = await prisma.account.findUnique({
      where: { apiKey: tokenToUse }
    });
    return account;
  } catch (err) {
    console.error('Auth error:', err);
    return null;
  }
}

export function parseDateRange(urlStr) {
  const { searchParams } = new URL(urlStr);
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');

  let startDate;
  let endDate;

  if (fromParam) {
    startDate = fromParam.includes('T')
      ? new Date(fromParam)
      : new Date(`${fromParam}T00:00:00.000Z`);
  } else {
    const now = new Date();
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    startDate.setHours(0, 0, 0, 0);
  }

  if (toParam) {
    endDate = toParam.includes('T')
      ? new Date(toParam)
      : new Date(`${toParam}T23:59:59.999Z`);
  } else {
    endDate = new Date();
  }

  return { startDate, endDate };
}
