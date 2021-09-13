import { Request } from 'express'

export interface TelegramOptions {
  // An unique token which you can get from @BotFather
  botToken: string
  // Max seconds expiration. Default is 86400
  queryExpiration?: number
  // Should pass express req as first argument if true
  passReqToCallback?: boolean
}

// Typical query received to redirectUrl
export interface TelegramUser {
  auth_date: number
  first_name: string
  hash: string
  id: string
  last_name: string
  username: string
  photo_url: string
}

// Normalized profile: http://www.passportjs.org/docs/profile/
// With intent to make this backwards compatible we clone the original data format
export type PassportTelegramUser = TelegramUser & {
  provider: 'telegram'
  id: string
  displayName: string
  name: {
    // last name
    familyName: string
    // first name
    givenName: string
  }
  photos: Array<{
    value: string
  }>
}

export type DoneCallback = (err: any, user: any, info: any) => void

export type CallbackWithRequest = (
  req: Request,
  user: PassportTelegramUser,
  done: DoneCallback
) => void
export type CallbackWithoutRequest = (user: PassportTelegramUser, done: DoneCallback) => void

export type VerifyCallback = CallbackWithRequest | CallbackWithoutRequest
