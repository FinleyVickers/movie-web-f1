import "core-js/stable";
import React, { Suspense } from "react";
import type { ReactNode } from "react";
import ReactDOM from "react-dom";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";

import { ErrorBoundary } from "@/pages/errors/ErrorBoundary";
import App from "@/setup/App";
import { conf } from "@/setup/config";
import i18n from "@/setup/i18n";
import "@/setup/ga";
import "@/setup/index.css";
import { useLanguageStore } from "@/stores/language";

import { initializeChromecast } from "./setup/chromecast";
import { initializeOldStores } from "./stores/__old/migrations";

// initialize
const key =
  (window as any)?.__CONFIG__?.VITE_KEY ?? import.meta.env.VITE_KEY ?? null;
if (key) {
  (window as any).initMW(conf().PROXY_URLS, key);
}
initializeChromecast();
registerSW({
  immediate: true,
});

const LazyLoadedApp = React.lazy(async () => {
  await initializeOldStores();
  i18n.changeLanguage(useLanguageStore.getState().language);
  return {
    default: App,
  };
});

function TheRouter(props: { children: ReactNode }) {
  const normalRouter = conf().NORMAL_ROUTER;

  if (normalRouter) return <BrowserRouter>{props.children}</BrowserRouter>;
  return <HashRouter>{props.children}</HashRouter>;
}

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <TheRouter>
          <Suspense fallback="">
            <LazyLoadedApp />
          </Suspense>
        </TheRouter>
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById("root")
);
