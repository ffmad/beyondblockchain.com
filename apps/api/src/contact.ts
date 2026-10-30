import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Injectable,
  Ip,
  Logger,
  Post,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { Database } from './database.js';
import { storedTriage, triageMessage, type Triage } from './contact-triage.js';

// The contact form. Each message is saved first, then delivered to Slack through an incoming webhook
// (SLACK_WEBHOOK_CONTACT), and retried with backoff if Slack is unreachable, as Ikitai does for feedback.
// Without a webhook, messages wait in the database until one is configured. With an Anthropic key, Claude's
// notes (summary, language, kind, spam flag, draft reply) are added first; see contact-triage.ts.

const LIMITS = { name: 100, email: 200, message: 3000 };
const MIN_FILL_MS = 2500;
const PER_ADDRESS = { count: 5, windowMs: 60 * 60 * 1000 };
const SITE_WIDE = { count: 60, windowMs: 60 * 60 * 1000 };
const RETRY_DELAYS_S = [60, 300, 1800, 7200, 43200];
const POLL_MS = 60 * 1000;

const plain = (text: string) => ({ type: 'plain_text', text, emoji: false });

/** The webhook address, only if it really is a Slack incoming webhook. */
export function contactWebhook(raw = process.env.SLACK_WEBHOOK_CONTACT): string | null {
  if (!raw?.trim()) return null;
  try {
    const url = new URL(raw.trim());
    const valid =
      url.protocol === 'https:' &&
      url.hostname === 'hooks.slack.com' &&
      !url.port &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      /^\/services\/[A-Za-z0-9]+\/[A-Za-z0-9]+\/[A-Za-z0-9]+$/.test(url.pathname);
    return valid ? url.href : null;
  } catch {
    return null;
  }
}

interface StoredMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  locale: string;
  page: string;
  asked?: string | null;
  createdAt: Date;
}

// Everything the sender typed, and Claude's notes about it, stays plain_text, so Slack mentions and formatting
// in it can't notify anyone. Only the fixed reply link uses mrkdwn, with an address that passed validation; it
// opens a reply with the draft filled in.
export function slackPayload(row: StoredMessage, notes: Triage | null = null) {
  const draft = notes?.reply ? `&body=${encodeURIComponent(notes.reply)}` : '';
  const mailto = `mailto:${encodeURIComponent(row.email)}?subject=${encodeURIComponent('Re: your message to Beyond Blockchain')}${draft}`;
  const heading = notes?.spam
    ? 'Likely spam, from beyondblockchain.com'
    : 'New message from beyondblockchain.com';
  const summary = notes
    ? [
        { type: 'section', text: plain(notes.summary) },
        {
          type: 'context',
          elements: [
            plain(`${notes.kind} · ${notes.language}${notes.spam ? ' · likely spam' : ''}`),
          ],
        },
        { type: 'divider' },
      ]
    : [];
  const reply = notes?.reply
    ? [{ type: 'section', text: plain(`Draft reply (check before sending):\n\n${notes.reply}`) }]
    : [];
  return {
    text: 'Beyond Blockchain: new message from the contact form',
    blocks: [
      { type: 'header', text: plain(heading) },
      ...summary,
      { type: 'section', text: plain(`${row.name} · ${row.email}`) },
      ...(row.asked
        ? [{ type: 'context', elements: [plain(`Asked the site's assistant: ${row.asked}`)] }]
        : []),
      { type: 'section', text: plain(row.message) },
      ...reply,
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `<${mailto}|Reply by email>`, verbatim: true },
      },
      {
        type: 'context',
        elements: [
          plain(
            `${row.locale.toUpperCase()} · ${row.page} · ${row.createdAt.toISOString()} · ${row.id.slice(0, 8)}`,
          ),
        ],
      },
    ],
    unfurl_links: false,
    unfurl_media: false,
  };
}

type Delivery = { ok: true } | { ok: false; code: string; permanent: boolean };

async function postToSlack(url: string, payload: unknown): Promise<Delivery> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
      redirect: 'error',
    });
    if (response.ok && (await response.text()).trim() === 'ok') return { ok: true };
    const permanent =
      response.status >= 400 && response.status < 500 && ![408, 429].includes(response.status);
    return { ok: false, code: `slack_http_${response.status}`, permanent };
  } catch {
    // Never log the webhook address, the message or Slack's response body.
    return { ok: false, code: 'slack_network', permanent: false };
  }
}

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]+$/;

@Injectable()
export class ContactService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('Contact');
  private readonly recent = new Map<string, number[]>();
  private siteWide: number[] = [];
  private timer: ReturnType<typeof setInterval> | undefined;
  private delivering = false;

  constructor(private readonly database: Database) {}

  onModuleInit() {
    this.timer = setInterval(() => void this.deliverDue(), POLL_MS);
    this.timer.unref();
  }
  onModuleDestroy() {
    clearInterval(this.timer);
  }

  private allow(address: string, now = Date.now()) {
    const keep = (times: number[], windowMs: number) => times.filter((t) => now - t < windowMs);
    const mine = keep(this.recent.get(address) ?? [], PER_ADDRESS.windowMs);
    this.siteWide = keep(this.siteWide, SITE_WIDE.windowMs);
    if (mine.length >= PER_ADDRESS.count || this.siteWide.length >= SITE_WIDE.count) return false;
    mine.push(now);
    this.siteWide.push(now);
    this.recent.set(address, mine);
    if (this.recent.size > 5000) this.recent.clear();
    return true;
  }

  async receive(body: unknown, address: string) {
    const input = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
    // Bots fill the hidden field or submit instantly; they're told it worked and nothing is kept.
    const elapsed = Number(input.elapsed);
    if (text(input.website) || !Number.isFinite(elapsed) || elapsed < MIN_FILL_MS)
      return { ok: true };

    const name = text(input.name);
    const email = text(input.email);
    const message = text(input.message);
    const invalid = [
      (!name || name.length > LIMITS.name) && 'name',
      (!EMAIL.test(email) || email.length > LIMITS.email) && 'email',
      (message.length < 2 || message.length > LIMITS.message) && 'message',
    ].filter(Boolean);
    if (invalid.length) throw new BadRequestException({ error: 'invalid', fields: invalid });
    if (!this.allow(address))
      throw new HttpException({ error: 'rate_limited' }, HttpStatus.TOO_MANY_REQUESTS);

    const locale = input.locale === 'ja' ? 'ja' : 'en';
    const page = text(input.page).slice(0, 200) || '/';
    // From the site's assistant: the questions asked before writing, so the message arrives with its context.
    const asked = text(input.asked).slice(0, 300) || null;
    await this.database.client.contactMessage.create({
      data: { name, email, message, locale, page, asked },
    });
    void this.deliverDue();
    return { ok: true };
  }

  /** Sends every message that is due, oldest first. Runs after each new message and every minute. */
  async deliverDue() {
    const url = contactWebhook();
    if (!url || this.delivering) return;
    this.delivering = true;
    try {
      const due = await this.database.client.contactMessage.findMany({
        where: { delivery: 'pending', nextAttemptAt: { lte: new Date() } },
        orderBy: { createdAt: 'asc' },
        take: 20,
      });
      for (const row of due) {
        // Notes are made once; a retry reuses them.
        let notes = storedTriage(row.triage);
        if (!notes) {
          notes = await triageMessage(row);
          if (notes)
            await this.database.client.contactMessage.update({
              where: { id: row.id },
              data: { triage: notes },
            });
        }
        const result = await postToSlack(url, slackPayload(row, notes));
        const attempts = row.attempts + 1;
        if (result.ok) {
          await this.database.client.contactMessage.update({
            where: { id: row.id },
            data: { delivery: 'sent', attempts, sentAt: new Date(), lastError: null },
          });
          continue;
        }
        const giveUp = result.permanent || attempts > RETRY_DELAYS_S.length;
        const delay = RETRY_DELAYS_S[Math.min(attempts, RETRY_DELAYS_S.length) - 1]!;
        await this.database.client.contactMessage.update({
          where: { id: row.id },
          data: {
            delivery: giveUp ? 'failed' : 'pending',
            attempts,
            lastError: result.code,
            nextAttemptAt: new Date(Date.now() + delay * 1000),
          },
        });
        if (giveUp)
          this.logger.warn(`Contact message ${row.id.slice(0, 8)} not delivered: ${result.code}`);
        // Stop for now if Slack itself is failing; the next round retries.
        if (!result.permanent) break;
      }
    } catch {
      this.logger.warn('Contact delivery round failed');
    } finally {
      this.delivering = false;
    }
  }
}

@Controller('api')
export class ContactController {
  constructor(private readonly contact: ContactService) {}

  @Post('contact')
  @HttpCode(202)
  send(@Body() body: unknown, @Ip() address: string) {
    return this.contact.receive(body, address || 'unknown');
  }
}
