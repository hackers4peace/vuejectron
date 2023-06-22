import { getDefaultSession } from "@inrupt/solid-client-authn-browser";
import { Application } from "@janeirodigital/interop-application";
import { Agent } from "@/models";

let saiSession: Application | undefined;
let webId: string

const authnFetch = getDefaultSession().fetch;

export function useSai(userId: string | null) {
  if (saiSession) {
    if (saiSession.webId !== webId) throw new Error('WebId mismatch!')
  } else {
    if (!userId) throw new Error('no user id')
    webId = userId
  }

  return { isAuthorized, getAuthorizationRedirectUri, getAgents}
}

async function ensureSaiSession(): Promise<Application> {
  if (saiSession) return saiSession
  const deps = { fetch: authnFetch, randomUUID: crypto.randomUUID.bind(crypto) }
  return saiSession = await Application.build(webId, import.meta.env.VITE_APPLICATION_ID, deps)
}

async function isAuthorized(): Promise<boolean> {
  const session = await ensureSaiSession()
  return !!session.hasApplicationRegistration?.hasAccessGrant.granted
}

async function getAuthorizationRedirectUri(): Promise<string> {
  const session = await ensureSaiSession()
  return session.authorizationRedirectUri
}

async function getAgents(): Promise<Agent[]> {
  const session = await ensureSaiSession()

  const profiles = await Promise.all(
    session.dataOwners.map(owner => session.factory.readable.webIdProfile(owner.iri))
  )

  return profiles.map(profile => ({
    id: profile.iri,
    label: profile.label || 'unknown' // TODO think of a better fallback
  }))
}
