import crypto from 'crypto';
import rndString from 'randomstring';
import config from '../../config.js';
import TTLCache from '@isaacs/ttlcache';
const U128_MAX = 340282366920938463463374607431768211455n;

const store = new TTLCache({
  ttl: config.pow.ttl,
  max: config.pow.max
});
const tokens = new TTLCache({
  ttl: config.token.ttl,
  max: config.token.max
});

const charsLower = 'abcdefghijklmnopqrstuvwxyz';
const charset = `${charsLower}${charsLower.toUpperCase()}0123456789=$#<%>?@^\`\\/~&*:;.,'|"´-+!{[]}`;
const difficulties = {};
const { seconds, levels, stepInt } = config.pow;

// in process activity calculation solved with a ring buffer
let level = 0;
const buckets = [];
let num = 0;
const maxBuckets = seconds * 1000 / stepInt;
let total = 0;

// prime buckets for traffic eval
for (let i = 0; i < maxBuckets; ++i) {
  buckets[i] = 0;
}

setInterval(() => {
  if (++num % maxBuckets === 0) num = 0;

  total -= buckets[num];
  buckets[num] = 0;
}, stepInt);

setInterval(() => {
  if (total <= 3) level = 0;
  else if (total <= 7) level = 1;
  else level = 2;
}, 1000);

// floating point math is expensive (with bigint even more). Caching the result
// delivers significant performance boost
for (const x of levels) {
  difficulties[x] = U128_MAX - U128_MAX / BigInt(x);
}

// const store = { test: { salt: '123', diff: difficulties[50000] } };
// const tokens = {};

export default {

  async siteverify (request, reply) {
    const { token, key, secret } = request.body;

    if (!config.clients[key] || config.clients[key].secret !== secret) {
      return { code: 403, error: 'Forbidden' };
    }

    let valid;

    const fromTokenStore = tokens.get(`${key}_${token}`);

    if (!fromTokenStore) {
      valid = false;
    } else {
      tokens.delete(`${key}_${token}`);
      valid = true;
    }

    return { code: 200, valid };
  },

  async getPow (request, reply) {
    const { key } = request.body;

    if (!config.clients[key]) {
      return { code: 404, error: 'Not found' };
    }

    ++buckets[num];
    ++total;

    const string = rndString.generate(32);
    const difficultyFactor = levels[level];
    const salt = rndString.generate({
      length: 32,
      charset
    });

    store.set(string, { diff: difficulties[difficultyFactor], salt, key });

    return { string, difficulty_factor: difficultyFactor, salt };
  },

  async powVerify (request, reply) {
    const { result, nonce, string, key } = request.body;

    if (string.length > 0xff) {
      return { code: 400, error: 'Invalid string' };
    }

    const fromStore = store.get(string);
    if (!fromStore) {
      return { code: 400, error: 'String not found' };
    }

    const { salt, diff, key: dKey } = fromStore;

    if (dKey !== key) {
      return { code: 400, error: 'String not found' };
    }

    store.delete(string);

    const prefix = Buffer.from([string.length, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0]);
    let res = false;

    const hash = crypto.createHash('sha256').update(`${salt}${prefix}${string}${nonce}`).digest('hex');
    const p = BigInt(result);
    if (hash.startsWith(p.toString(16)) && p > diff) res = true;

    if (res === false) {
      return { code: 400, error: 'Wrong hash!' };
    }

    const token = rndString.generate(24);

    tokens.set(`${key}_${token}`, true);

    return { code: 200, token };
  }
};
