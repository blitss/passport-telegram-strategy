import { Strategy } from 'passport-strategy';
import { assign } from 'lodash';
import * as express from 'express';
import * as crypto from 'crypto';
import deferPromise from './deferPromise';

export type TelegramOptions = {
  // An unique token which you can get from @BotFather
  botToken: string;
  // Max seconds expiration. Default is 86400
  queryExpiration?: number;
  // Should pass express req as first argument if true
  passReqToCallback?: boolean
}

// Typical query received to redirectUrl
export type TelegramUser = {
  auth_date: number;
  first_name: string;
  hash: string
  id: number;
  last_name: string;
  username: string;
}

export type DoneCallback = (err: any, user: any, info: any) => void;

export type CallbackWithRequest = (req: express.Request, user: TelegramUser, done: DoneCallback) => void;
export type CallbackWithoutRequest = (user: TelegramUser, done: DoneCallback) => void;

export type VerifyCallback = CallbackWithRequest | CallbackWithoutRequest;

export const defaultOptions = {
  queryExpiration: 86400,
  passReqToCallback: false,
};

/**
 * `TelegramStrategy` constructor.
 *
 * The Telegram authentication strategy authenticates requests by delegating to
 * Telegram using their protocol: https://core.telegram.org/widgets/login
 *
 * Applications must supply a `verify` callback which accepts an `account` object,
 * and then calls `done` callback sypplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occurred, `error` should be set.
 *
 * More info here: https://core.telegram.org/widgets/login
 *
 * @param {Object} options
 * @param {Function} verify
 * @example
 * passport.use(new TelegramStrategy({
 *   botId: 12434151
 * }), (user) => {
 *   User.findOrCreate({telegramId: user.id}, done);
 * });
 */
export default class TelegramStrategy extends Strategy {
  name: string;
  options: TelegramOptions;
  verify;
  hashedBotToken: Buffer;

  constructor(options: TelegramOptions, verify: VerifyCallback) {
    super();

    if (!options.botToken) {
      throw new TypeError('options.botToken is required in TelegramStrategy');
    }
    if (!verify) {
      throw new TypeError('LocalStrategy requires a verify callback');
    }

    this.options = assign({}, defaultOptions, options);
    this.name = 'telegram';
    this.verify = verify;
    this.hashedBotToken = this.botToken();
  }

  authenticate(req: express.Request, options?: any) {
    const query = req.method === 'GET' ? req.query : req.body;

    try {
      const validationResult = this.validateQuery(req);
      if (validationResult !== true) return validationResult;

      const promise = deferPromise();

      if (this.options.passReqToCallback) {
        this.verify(req, query, promise.callback);
      } else {
        this.verify(query, promise.callback);
      }

      promise.then(([user, info]) => {
        if (!user) return this.fail(info);
        this.success(user, info);
      }).catch((err) => {
        return this.error(err);
      });
    } catch (e) {
      return this.error(e);
    }
  }

  /**
   * Function to check if provided date in callback is outdated
   * @returns {number}
   */
  getTimestamp() {
    return parseInt((+new Date / 1000) as any, 10);
  }

  // We have to hash botToken too
  botToken() {
    // Use buffer to better performance
    return crypto.createHash('sha256').update(this.options.botToken).digest();
  }

  /**
   * Used to validate if fields like telegram must send are exists
   * @param {e.Request} req
   * @returns {any}
   */
  validateQuery(req: express.Request): boolean | void {
    const query = req.method === 'GET' ? req.query : req.body;

    if (!query.auth_date || !query.hash || !query.id) {
      return this.fail({ message: 'Missing some important data' }, 400);
    }

    const authDate = parseInt(query.auth_date);
    if (this.options.queryExpiration !== -1 &&
     (isNaN(authDate) || this.getTimestamp() - authDate > this.options.queryExpiration)
    ) {
      return this.fail({ message: 'Data is outdated' }, 400);
    }

    const sorted = Object.keys(query).sort();
    const mapped = sorted // Everything except hash must be mapped
     .filter(d => d !== 'hash')
     .map(key => `${key}=${query[key]}`);

    const hashString = mapped.join('\n');
    const hash = crypto
     .createHmac('sha256', this.hashedBotToken)
     .update(hashString)
     .digest('hex');

    if (hash !== query.hash) return this.fail({ message: 'Hash validation failed' }, 403);

    return true;
  }
}