import { defineStore } from 'pinia'
import { ref } from 'vue';
import { ISessionInfo, getDefaultSession, handleIncomingRedirect, login as oidcLogin} from "@inrupt/solid-client-authn-browser";
import { Application } from '@janeirodigital/interop-application';

class OidcError extends Error {
  constructor(private oidcInfo?: ISessionInfo) {
     super('oidcInfo');
  }
}

class NoSaiSessionError extends Error {
  constructor() {
    super('buildSession was not called');
  }
}

let saiSession: Application | undefined;
const authnFetch = getDefaultSession().fetch;

export const useCoreStore = defineStore('core', () => {
  const userId = ref<string | null>(null)
  const isAuthorized = ref(false)
  const authorizationRedirectUri = ref<string | null>(null)

  async function login(oidcIssuer: string) {
    const options = {
      clientId: import.meta.env.VITE_APPLICATION_ID,
      oidcIssuer,
      redirectUrl: `${import.meta.env.VITE_BASE_URL}/redirect`,
    }
    await oidcLogin(options);
  }

  async function handleRedirect(url: string) {
    const oidcInfo = await handleIncomingRedirect(url);
    if (!oidcInfo?.webId) {
      throw new OidcError(oidcInfo);
    }
    userId.value = oidcInfo.webId

    await buildSaiSession()
    if (!saiSession) {
      throw new NoSaiSessionError();
    }

    if (saiSession.hasApplicationRegistration) {
      isAuthorized.value = !!saiSession.hasApplicationRegistration.hasAccessGrant.granted
    } else if (saiSession.authorizationRedirectUri) {
      authorizationRedirectUri.value = saiSession.authorizationRedirectUri
    } else {
      throw new Error('Impossible to authorize!')
    }
  }

  async function buildSaiSession(): Promise<void> {
    const deps = { fetch: authnFetch, randomUUID: crypto.randomUUID.bind(crypto) }
    saiSession = await Application.build(userId.value!, import.meta.env.VITE_APPLICATION_ID, deps)
  }

  async function authorize() {
    if (!saiSession) {
      throw new NoSaiSessionError();
    }
    if (saiSession.authorizationRedirectUri) {
      window.location.href = saiSession.authorizationRedirectUri;
    } else {
      throw new Error('authorizationRedirectUri is undefined');
    }
  }

  async function restoreOidcSession(): Promise<void> {
    const oidcSession = getDefaultSession();

    if (!oidcSession.info.isLoggedIn) {
      // if session can be restored it will redirect to oidcIssuer, which will return back to `/redirect`
      await oidcSession.handleIncomingRedirect({ restorePreviousSession: true });
    }
  }

  return { userId, isAuthorized, authorizationRedirectUri, login, authorize, handleRedirect, restoreOidcSession}
})

