import * as crypto                         from 'crypto'
import { Request }                         from 'express'
import { Strategy }                        from 'passport-strategy'

import deferPromise                        from './deferPromise'
import { normalizeProfile }                from './normalizeProfile'
import { TelegramOptions, VerifyCallback } from './types'

export const defaultOptions = {
  queryExpiration: 86400,
  passReqToCallback: false,
}

export const whitelistParams = [
  'id',
  'first_name',
  'last_name',
  'username',
  'photo_url',
  'auth_date',
]

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
  readonly name: string = 'telegram'

  readonly options: TelegramOptions

  protected readonly verify

  protected readonly hashedBotToken: Buffer

  constructor(options: TelegramOptions, verify: VerifyCallback) {
    super()

    if (!options.botToken) {
      throw new TypeError('options.botToken is required in TelegramStrategy')
    }
    if (!verify) {
      throw new TypeError('LocalStrategy requires a verify callback')
    }

    this.options = {
      ...defaultOptions,
      ...options,
    }

    this.verify = verify
    this.hashedBotToken = this.getBotToken()
  }

  // eslint-disable-next-line consistent-return
  authenticate(req: Request, options?: any) {
    const query = req.method === 'GET' ? req.query : req.body

    try {
      const validationResult = this.validateQuery(req)
      if (validationResult !== true) {
        return validationResult
      }

      const profile = normalizeProfile(query)
      const promise = deferPromise()

      if (this.options.passReqToCallback) {
        this.verify(req, profile, promise.callback)
      } else {
        this.verify(profile, promise.callback)
      }

      promise
        .then(([user, info]) => {
          if (!user) {
            return this.fail(info)
          }

          return this.success(user, info)
        })
        .catch(err => {
          return this.error(err)
        })
    } catch (e) {
      return this.error(e)
    }
  }

  /**
   * Function to check if provided date in callback is outdated
   * @returns {number}
   */
  protected getTimestamp(): number {
    return Math.floor(Date.now() / 1000)
  }

  // We have to hash botToken too
  protected getBotToken(): Buffer {
    return crypto.createHash('sha256').update(this.options.botToken).digest()
  }

  /**
   * Used to validate if fields like telegram must send are exists
   * @param {e.Request} req
   * @returns {any}
   */
  validateQuery(req: Request): boolean | void {
    const query = req.method === 'GET' ? req.query : req.body

    if (!query.auth_date || !query.hash || !query.id) {
      return this.fail({ message: 'Missing some important data' }, 400)
    }

    const authDate = Math.floor(Number(query.auth_date))
    if (
      this.options.queryExpiration !== -1 &&
      (Number.isNaN(authDate) || this.getTimestamp() - authDate > this.options.queryExpiration)
    ) {
      return this.fail({ message: 'Data is outdated' }, 400)
    }

    const sorted = Object.keys(query).sort()
    const mapped = sorted // Only whitelisted query parameters must be mapped
      .filter(d => whitelistParams.includes(d))
      .map(key => `${key}=${query[key]}`)

    const hashString = mapped.join('\n')
    const hash = crypto.createHmac('sha256', this.hashedBotToken).update(hashString).digest('hex')

    if (hash !== query.hash) {
      return this.fail({ message: 'Hash validation failed' }, 403)
    }

    return true
  }
}
