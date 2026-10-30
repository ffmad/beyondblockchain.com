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
  ServiceUnavailableException,
  type OnModuleInit,
} from '@nestjs/common';
import { fileURLToPath } from 'node:url';
import { knowledge, type Fact } from './content/knowledge.js';

// The site's assistant understands questions with a small multilingual sentence model run on this server's CPU
// (paraphrase-multilingual-MiniLM-L12-v2, quantised: about 120 MB, downloaded once from Hugging Face into
// ASSISTANT_MODEL_DIR). At startup every fact and example question in the knowledge base becomes a meaning vector;
// a visitor's question is matched to the closest one, and the answer is that fact, word for word. Below a minimum
// similarity the assistant says it doesn't know. It never writes text of its own, so it can't make anything up, and
// it needs no API key and costs nothing per question. ASSISTANT_MODEL=off turns it off: the site then answers with
// its keyword topics.

export type Embed = (texts: string[]) => Promise<number[][]>;

const MODEL_ID = 'Xenova/paraphrase-multilingual-MiniLM-L12-v2';
/** Below this similarity (cosine), a question is too far from anything known. Tuned with tools/assistant-eval.mjs. */
export const MIN_SIMILARITY = 0.5;
const MAX_QUESTION = 300;
const PER_ADDRESS = { count: 30, windowMs: 10 * 60 * 1000 };
const SITE_WIDE = { count: 1500, windowMs: 60 * 60 * 1000 };

type Language = keyof typeof knowledge;
const JAPANESE = /[぀-ヿ㐀-鿿ｦ-ﾟ]/;
/** The language to answer in: the question's own, whichever page it was asked on. */
export const questionLanguage = (question: string): Language =>
  JAPANESE.test(question) ? 'ja' : 'en';

// Asking about "Quentin" or "him" is asking the same thing as "you": the examples are mostly written to "you".
const normalise = (text: string) =>
  text
    .replace(/\bquentin(?:'s|’s)\b/gi, 'your')
    .replace(/\bquentin\b/gi, 'you')
    .replace(/\bhis\b/gi, 'your')
    .replace(/\b(?:he|him)\b/gi, 'you');

const dot = (a: number[], b: number[]) => {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i]! * b[i]!;
  return sum;
};

export interface Match {
  fact: Fact;
  score: number;
}

/** Matches questions to facts by meaning, with any embedding function: the model, or a stand-in in tests. */
export class KnowledgeIndex {
  private entries: Record<Language, { fact: Fact; vector: number[] }[]> | null = null;

  constructor(private readonly embed: Embed) {}

  // Only the example questions are matched: a question resembles other questions more than it resembles answers.
  async build() {
    const entries = {} as NonNullable<typeof this.entries>;
    for (const language of Object.keys(knowledge) as Language[]) {
      const items = knowledge[language].flatMap((fact) =>
        fact.asks.map((text) => ({ fact, text: normalise(text) })),
      );
      const vectors = await this.embed(items.map((item) => item.text));
      entries[language] = items.map((item, i) => ({ fact: item.fact, vector: vectors[i]! }));
    }
    this.entries = entries;
    return this;
  }

  /** The closest fact and how close it is, in the question's language. */
  async match(question: string): Promise<Match | null> {
    if (!this.entries) await this.build();
    const [vector] = await this.embed([normalise(question)]);
    let best: Match | null = null;
    for (const entry of this.entries![questionLanguage(question)]) {
      const score = dot(vector!, entry.vector);
      if (!best || score > best.score) best = { fact: entry.fact, score };
    }
    return best;
  }
}

/** The sentence model, kept in ASSISTANT_MODEL_DIR (by default apps/api/.models). */
export async function loadModel(): Promise<Embed> {
  const { pipeline, env } = await import('@huggingface/transformers');
  env.cacheDir =
    process.env.ASSISTANT_MODEL_DIR?.trim() ||
    fileURLToPath(new URL('../.models/', import.meta.url));
  const extract = await pipeline('feature-extraction', MODEL_ID, { dtype: 'q8' });
  return async (texts) =>
    (await extract(texts, { pooling: 'mean', normalize: true })).tolist() as number[][];
}

export const assistantEnabled = () => process.env.ASSISTANT_MODEL?.trim() !== 'off';

@Injectable()
export class AssistantService implements OnModuleInit {
  private readonly logger = new Logger('Assistant');
  private readonly recent = new Map<string, number[]>();
  private siteWide: number[] = [];
  private index: Promise<KnowledgeIndex> | null = null;

  // The model loads in the background at startup, so the first visitor doesn't wait for it.
  onModuleInit() {
    if (assistantEnabled()) void this.ready().catch(() => undefined);
  }

  private ready() {
    this.index ??= loadModel()
      .then((embed) => new KnowledgeIndex(embed).build())
      .catch((error: Error) => {
        this.index = null;
        this.logger.warn(`The assistant's model could not be loaded: ${error.message}`);
        throw error;
      });
    return this.index;
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

  // Questions aren't kept: each one is answered and forgotten.
  async ask(body: unknown, address: string) {
    const input = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
    const question = typeof input.question === 'string' ? input.question.trim() : '';
    if (!question || question.length > MAX_QUESTION)
      throw new BadRequestException({ error: 'invalid' });
    if (!this.allow(address))
      throw new HttpException({ error: 'rate_limited' }, HttpStatus.TOO_MANY_REQUESTS);
    if (!assistantEnabled()) throw new ServiceUnavailableException({ error: 'unavailable' });
    let index: KnowledgeIndex;
    try {
      index = await this.ready();
    } catch {
      throw new ServiceUnavailableException({ error: 'unavailable' });
    }
    const match = await index.match(question);
    if (!match || match.score < MIN_SIMILARITY) return { answer: null };
    const { fact } = match;
    return {
      id: fact.id,
      answer: fact.answer,
      ...(fact.link && { link: fact.link }),
      ...(fact.offer && { offer: fact.offer }),
    };
  }
}

@Controller('api')
export class AssistantController {
  constructor(private readonly assistant: AssistantService) {}

  @Post('assistant')
  @HttpCode(200)
  ask(@Body() body: unknown, @Ip() address: string) {
    return this.assistant.ask(body, address || 'unknown');
  }
}
