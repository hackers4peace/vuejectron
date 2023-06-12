import { defineStore } from 'pinia'
import { ref } from 'vue';
import { ISessionInfo, handleIncomingRedirect, login as oidcLogin} from "@inrupt/solid-client-authn-browser";

class OidcError extends Error {
  constructor(private oidcInfo?: ISessionInfo) {
     super('oidcInfo');
  }
}

export const useCoreStore = defineStore('core', () => {
  const userId = ref<string | null>(null)
  const isAuthorized = ref(false)

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
  }

  return { userId, isAuthorized, login, handleRedirect}
})

