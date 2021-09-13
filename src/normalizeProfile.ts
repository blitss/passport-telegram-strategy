import { PassportTelegramUser, TelegramUser } from './types'

export function normalizeProfile(profile: TelegramUser): PassportTelegramUser {
  const normalizedProfile: PassportTelegramUser = {
    ...profile,
    provider: 'telegram',
    displayName: profile.username,
    name: {
      givenName: profile.first_name,
      familyName: profile.last_name,
    },
    photos: profile.photo_url ? [{ value: profile.photo_url }] : [],
  }

  return normalizedProfile
}
