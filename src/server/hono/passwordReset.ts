import crypto from 'crypto';
import {Hono} from 'hono';
import {normalizeUserId} from '../../common/utils/normalizeUserId';
import {GameLoader} from '../database/GameLoader';
import {User} from '../User';
import {myId} from '../UserUtil';

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

interface GenerateResetRequest {
  adminUserId?: string;
  targetUserId?: string;
}

interface CompleteResetRequest {
  userName?: string;
  token?: string;
  password?: string;
}

function hashResetToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function findUserByName(userName: string | undefined): Promise<User | undefined> {
  return GameLoader.getInstance().getUserByName((userName ?? '').trim().toLowerCase());
}

function clearResetToken(user: User): void {
  user.passwordResetTokenHash = '';
  user.passwordResetTokenExpiresAt = 0;
}

export const passwordResetRoutes = new Hono();

passwordResetRoutes.post('/generate', async (c) => {
  const body = await c.req.json<GenerateResetRequest>();
  const adminUserId = body.adminUserId ?? '';

  if (normalizeUserId(adminUserId) !== myId) {
    return c.json({error: 'Unauthorized'}, 401);
  }

  const user = await GameLoader.getInstance().getUserById(body.targetUserId ?? '');
  if (user === undefined) {
    return c.json({error: 'User not found'}, 404);
  }

  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = Date.now() + RESET_TOKEN_TTL_MS;
  user.passwordResetTokenHash = hashResetToken(token);
  user.passwordResetTokenExpiresAt = expiresAt;

  const resetUrl = new URL('/reset-password', c.req.url);
  resetUrl.searchParams.set('userName', user.name);
  resetUrl.searchParams.set('token', token);

  return c.json({
    resetUrl: resetUrl.toString(),
    expiresAt,
  });
});

passwordResetRoutes.post('/complete', async (c) => {
  const body = await c.req.json<CompleteResetRequest>();
  const user = await findUserByName(body.userName);

  if (user === undefined) {
    return c.json({error: 'Invalid or expired reset token'}, 400);
  }

  const password = (body.password ?? '').trim().toLowerCase();
  if (password.length <= 2) {
    return c.json({error: 'Please enter at least 3 characters for password'}, 400);
  }

  const token = body.token ?? '';
  const expectedTokenHash = user.passwordResetTokenHash ?? '';
  const expiresAt = user.passwordResetTokenExpiresAt ?? 0;

  if (expectedTokenHash.length === 0 || expiresAt < Date.now() || hashResetToken(token) !== expectedTokenHash) {
    return c.json({error: 'Invalid or expired reset token'}, 400);
  }

  user.password = password;
  clearResetToken(user);

  return c.json({success: true});
});

passwordResetRoutes.post('/check', async (c) => {
  const body = await c.req.json<CompleteResetRequest>();
  const user = await findUserByName(body.userName);

  if (user === undefined) {
    return c.json({error: 'Invalid or expired reset token'}, 400);
  }

  const token = body.token ?? '';
  const expectedTokenHash = user.passwordResetTokenHash ?? '';
  const expiresAt = user.passwordResetTokenExpiresAt ?? 0;

  if (expectedTokenHash.length === 0 || expiresAt < Date.now() || hashResetToken(token) !== expectedTokenHash) {
    return c.json({error: 'Invalid or expired reset token'}, 400);
  }

  return c.json({valid: true});
});
