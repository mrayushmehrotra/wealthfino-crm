import { mkdir, readFile, writeFile } from "fs/promises"
import { join } from "path"
import { importJWK, SignJWT, exportJWK, generateKeyPair } from "jose"

type StoredVapidKeys = {
  publicKey: string
  privateKey: string
}

const keysFile = join(process.cwd(), ".vapid-keys.json")
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@wealthfino.com"

async function loadOrCreateVapidKeys(): Promise<StoredVapidKeys> {
  const envPublic = process.env.VAPID_PUBLIC_KEY
  const envPrivate = process.env.VAPID_PRIVATE_KEY

  if (envPublic && envPrivate) {
    return { publicKey: envPublic, privateKey: envPrivate }
  }

  try {
    const stored = JSON.parse(
      await readFile(keysFile, "utf8")
    ) as StoredVapidKeys
    if (stored.publicKey && stored.privateKey) {
      return stored
    }
  } catch {
    // generate below
  }

  const { publicKey, privateKey } = await generateKeyPair("ES256")
  const publicJwk = await exportJWK(publicKey)
  const privateJwk = await exportJWK(privateKey)
  const stored = {
    publicKey: JSON.stringify(publicJwk),
    privateKey: JSON.stringify(privateJwk),
  }

  await mkdir(process.cwd(), { recursive: true })
  await writeFile(keysFile, JSON.stringify(stored, null, 2), "utf8")

  return stored
}

export async function getVapidPublicKey() {
  const { publicKey } = await loadOrCreateVapidKeys()
  // VAPID_PUBLIC_KEY env var may be a raw base64url key (not JWK JSON)
  if (!publicKey.startsWith("{")) {
    return publicKey
  }
  const jwk = JSON.parse(publicKey)
  const x = Buffer.from(jwk.x, "base64url")
  const y = Buffer.from(jwk.y, "base64url")
  return Buffer.concat([Buffer.from([0x04]), x, y]).toString("base64url")
}

async function getPrivateJwk() {
  const { privateKey } = await loadOrCreateVapidKeys()
  return JSON.parse(privateKey)
}

export async function sendPushNotification(subscriptionEndpoint: string) {
  const privateJwk = await getPrivateJwk()
  const endpointUrl = new URL(subscriptionEndpoint)
  const signingKey = await importJWK(privateJwk, "ES256")

  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: "ES256" })
    .setSubject(vapidSubject)
    .setAudience(endpointUrl.origin)
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(signingKey)

  const publicKey = await getVapidPublicKey()

  const response = await fetch(subscriptionEndpoint, {
    method: "POST",
    headers: {
      TTL: "60",
      Urgency: "high",
      Authorization: `vapid t=${jwt}, k=${publicKey}`,
    },
  })

  return response
}

export type SerializedPushSubscription = {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export function normalizeSubscriptionPayload(
  subscription: SerializedPushSubscription
) {
  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  }
}
