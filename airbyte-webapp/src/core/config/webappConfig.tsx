import React, { useContext } from "react";

import { getWebappConfig } from "core/api";
import { WebappConfigResponse } from "core/api/types/AirbyteClient";

export const WebappConfigContext = React.createContext<WebappConfigResponse | null>(null);

export const WebappConfigContextProvider: React.FC<React.PropsWithChildren<{ config: WebappConfigResponse }>> = ({
  children,
  config,
}) => {
  return <WebappConfigContext.Provider value={config}>{children}</WebappConfigContext.Provider>;
};

function normalizeConfig(config: WebappConfigResponse): WebappConfigResponse {
  return {
    ...config,
    edition: config.edition.toLowerCase(),
    coralAgentsApiUrl: config.coralAgentsApiUrl || process.env.REACT_APP_CORAL_AGENTS_API_URL,
    datadogApplicationId: config.datadogApplicationId || process.env.REACT_APP_DATADOG_APPLICATION_ID,
    datadogClientToken: config.datadogClientToken || process.env.REACT_APP_DATADOG_CLIENT_TOKEN,
    datadogSite: config.datadogSite || process.env.REACT_APP_DATADOG_SITE,
    datadogService: config.datadogService || process.env.REACT_APP_DATADOG_SERVICE,
    datadogEnv: config.datadogEnv || process.env.REACT_APP_DATADOG_ENV,
    hockeystackApiKey: config.hockeystackApiKey || process.env.REACT_APP_HOCKEYSTACK_API_KEY,
    launchdarklyKey: config.launchdarklyKey || process.env.REACT_APP_LAUNCHDARKLY_KEY,
    osanoKey: config.osanoKey || process.env.REACT_APP_OSANO_KEY,
    segmentToken: config.segmentToken || process.env.REACT_APP_SEGMENT_TOKEN,
    zendeskKey: config.zendeskKey || process.env.REACT_APP_ZENDESK_KEY,
    fullstoryGuidesOrgId: config.fullstoryGuidesOrgId || process.env.REACT_APP_FULLSTORY_GUIDES_ORG_ID,
  };
}

function getDevelopmentConfig(): WebappConfigResponse {
  return {
    version: "dev",
    edition: "community",
    keycloakBaseUrl: process.env.REACT_APP_KEYCLOAK_BASE_URL,
  };
}

function shouldUseDevelopmentConfig(): boolean {
  return process.env.NODE_ENV === "development" && process.env.REACT_APP_AILIV_USE_BACKEND !== "true";
}

export async function loadConfig() {
  if (shouldUseDevelopmentConfig()) {
    return normalizeConfig(getDevelopmentConfig());
  }

  try {
    const config = await getWebappConfig({ getAccessToken: () => Promise.resolve(null) });
    return normalizeConfig(config);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Using local Ailiv webapp config because the backend config endpoint is unavailable.", error);
      return normalizeConfig(getDevelopmentConfig());
    }
    throw error;
  }
}

export function useWebappConfig() {
  const config = useContext(WebappConfigContext);
  if (!config) {
    throw new Error("ConfigContext not found");
  }
  return config;
}
