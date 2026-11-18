import { useCallback, useEffect, useRef, useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { embeddedWebApp } from "./native/generatedWebApp";
import {
  BridgeMessage,
  extractOrderEntriesScript,
  loginScript,
  openPortalTabScript,
  portalMonitorScript,
  portalStateScript,
  printDetailsScript,
  searchPortalScript,
  selectOrderEntryScript,
  uiBridgeScript,
} from "./native/bridge";

const PORTAL_HOSTS = Array.from(
  { length: 12 },
  (_, index) => `app${String(index + 1).padStart(2, "0")}`,
);
const portalUrl = (host: string) =>
  `https://${host}.birchstreetsystems.com/j4/login.jsp?subscriberID=458&businessModelID=undefined`;

type Credentials = { loginID: string; password: string };
type PortalEntry = { value: string; label: string };
type PortalUser = { name: string; account: string };
type PortalSearchRequest = {
  section: "requests" | "orders" | "items" | "orderList";
  view?: string;
  column?: string;
  query?: string;
  entry?: string;
};

export default function App() {
  const ui = useRef<WebView>(null);
  const portal = useRef<WebView>(null);
  const credentialsRef = useRef<Credentials | null>(null);
  const loginPendingRef = useRef(false);
  const loginSubmittedRef = useRef(false);
  const loginTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSearchRef = useRef<Record<string, PortalSearchRequest>>({});
  const [hostIndex, setHostIndex] = useState(0);

  const sendUiEvent = useCallback((type: string, detail: Record<string, unknown> = {}) => {
    ui.current?.injectJavaScript(`
      window.dispatchEvent(new CustomEvent(${JSON.stringify(type)}, {
        detail: ${JSON.stringify(detail)}
      }));
      true;
    `);
  }, []);

  const log = useCallback(
    (level: "info" | "warn" | "error", message: string, detail: Record<string, unknown> = {}) => {
      sendUiEvent("birchstreet:log", {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...detail,
      });
    },
    [sendUiEvent],
  );

  const clearLoginTimer = useCallback(() => {
    if (loginTimerRef.current) clearTimeout(loginTimerRef.current);
    loginTimerRef.current = null;
  }, []);

  useEffect(() => clearLoginTimer, [clearLoginTimer]);

  const failLogin = useCallback(
    (message: string) => {
      clearLoginTimer();
      loginPendingRef.current = false;
      loginSubmittedRef.current = false;
      sendUiEvent("birchstreet:login-result", { success: false, error: message });
      log("error", message, { host: PORTAL_HOSTS[hostIndex] });
    },
    [clearLoginTimer, hostIndex, log, sendUiEvent],
  );

  const submitLogin = useCallback(
    (credentials: Credentials) => {
      credentialsRef.current = credentials;
      loginPendingRef.current = true;
      loginSubmittedRef.current = false;
      clearLoginTimer();
      log("info", "Submitting BirchStreet login", { host: PORTAL_HOSTS[hostIndex] });
      portal.current?.injectJavaScript(portalStateScript(false));
      portal.current?.injectJavaScript(loginScript(credentials.loginID, credentials.password));
      loginTimerRef.current = setTimeout(() => {
        if (loginPendingRef.current) {
          failLogin("BirchStreet login timed out. Check the activity log and try again.");
        }
      }, 60000);
    },
    [clearLoginTimer, failLogin, hostIndex, log],
  );

  const sendEntriesToUi = useCallback(
    (entries: PortalEntry[]) => {
      sendUiEvent("birchstreet:order-sheet-entries", {
        entries: entries.map((entry) => entry.label),
      });
    },
    [sendUiEvent],
  );

  const handleUiMessage = useCallback(
    (event: WebViewMessageEvent) => {
      let message: BridgeMessage;
      try {
        message = JSON.parse(event.nativeEvent.data);
      } catch {
        log("error", "The app sent an unreadable bridge message");
        return;
      }

      const detail = message.detail ?? {};
      switch (message.type) {
        case "birchstreet:login":
          submitLogin({
            loginID: String(detail.loginID ?? ""),
            password: String(detail.password ?? ""),
          });
          break;
        case "birchstreet:logout":
          credentialsRef.current = null;
          loginPendingRef.current = false;
          loginSubmittedRef.current = false;
          clearLoginTimer();
          log("info", "Signed out of the mobile interface");
          portal.current?.injectJavaScript(`
            try {
              localStorage.clear();
              sessionStorage.clear();
              location.href = ${JSON.stringify(portalUrl(PORTAL_HOSTS[hostIndex]))};
            } catch (error) {}
            true;
          `);
          break;
        case "birchstreet:refresh":
          {
            const section = String(detail.section ?? "");
            const previousSearch = lastSearchRef.current[section];
            log("info", "Refreshing live BirchStreet results", { section });
            if (previousSearch) {
              portal.current?.injectJavaScript(searchPortalScript(previousSearch));
            } else {
              portal.current?.reload();
            }
          }
          break;
        case "birchstreet:sync":
          log("info", "Requested BirchStreet synchronization", {
            list: String(detail.list ?? ""),
          });
          portal.current?.injectJavaScript(portalMonitorScript);
          break;
        case "birchstreet:search":
          {
            const searchRequest: PortalSearchRequest = {
              section: String(detail.section) as PortalSearchRequest["section"],
              view: String(detail.view ?? ""),
              column: String(detail.column ?? ""),
              query: String(detail.query ?? ""),
              entry: String(detail.entry ?? ""),
            };
            lastSearchRef.current[searchRequest.section] = searchRequest;
            log("info", "Started live BirchStreet search", {
              section: searchRequest.section,
              view: searchRequest.view,
              column: searchRequest.column,
              query: searchRequest.query,
            });
            portal.current?.injectJavaScript(searchPortalScript(searchRequest));
          }
          break;
        case "birchstreet:request-order-sheet-entries":
          log("info", "Loading Order Sheet entries");
          portal.current?.injectJavaScript(openPortalTabScript("Order Sheet"));
          setTimeout(() => portal.current?.injectJavaScript(extractOrderEntriesScript), 1800);
          break;
        case "birchstreet:select-order-sheet-entry":
          log("info", "Selected Order Sheet entry", { entry: String(detail.entry ?? "") });
          portal.current?.injectJavaScript(selectOrderEntryScript(String(detail.entry ?? "")));
          break;
        case "birchstreet:print-with-details":
          log("info", "Opening Print w/Details", {
            documentNumber: String(detail.documentNumber ?? ""),
          });
          portal.current?.injectJavaScript(printDetailsScript(String(detail.documentNumber ?? "")));
          break;
      }
    },
    [clearLoginTimer, hostIndex, log, submitLogin],
  );

  const handlePortalMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const message = JSON.parse(event.nativeEvent.data) as {
          type: string;
          detail?: Record<string, unknown>;
        };
        const detail = message.detail ?? {};
        switch (message.type) {
          case "portal:login-submitted":
            loginSubmittedRef.current = true;
            log("info", "BirchStreet accepted the login form submission", {
              host: PORTAL_HOSTS[hostIndex],
            });
            break;
          case "portal:authenticated": {
            const user = (detail.user ?? {}) as PortalUser;
            const wasPending = loginPendingRef.current;
            clearLoginTimer();
            loginPendingRef.current = false;
            loginSubmittedRef.current = false;
            if (wasPending) {
              sendUiEvent("birchstreet:login-result", { success: true, user, raw: detail.raw });
            }
            log("info", `Authenticated as ${user.name || "BirchStreet user"}`, {
              account: user.account ?? "",
              host: PORTAL_HOSTS[hostIndex],
            });
            break;
          }
          case "portal:login-failed":
            if (loginPendingRef.current) {
              if (hostIndex < PORTAL_HOSTS.length - 1) {
                const nextHost = PORTAL_HOSTS[hostIndex + 1];
                loginSubmittedRef.current = false;
                log(
                  "warn",
                  `Login was not confirmed on ${PORTAL_HOSTS[hostIndex]}; trying ${nextHost}`,
                );
                setHostIndex(hostIndex + 1);
              } else {
                failLogin(String(detail.message ?? "BirchStreet login failed."));
              }
            }
            break;
          case "portal:order-sheet-entries":
            sendEntriesToUi((detail.entries as PortalEntry[]) ?? []);
            log("info", "Loaded Order Sheet entries", {
              count: Array.isArray(detail.entries) ? detail.entries.length : 0,
            });
            break;
          case "portal:search-results":
            sendUiEvent("birchstreet:search-results", detail);
            log("info", "BirchStreet search completed", {
              section: String(detail.section ?? ""),
              count: Number(detail.count ?? 0),
            });
            break;
          case "portal:search-status":
            sendUiEvent("birchstreet:search-status", detail);
            break;
          case "portal:search-error":
            sendUiEvent("birchstreet:search-error", detail);
            log("error", String(detail.message ?? "BirchStreet search failed"), {
              section: String(detail.section ?? ""),
            });
            break;
          case "portal:log":
            log(
              detail.level === "error" ? "error" : detail.level === "warn" ? "warn" : "info",
              String(detail.message ?? "Portal event"),
              { url: String(detail.url ?? "") },
            );
            break;
        }
      } catch {
        log("error", "Received an unreadable message from BirchStreet");
      }
    },
    [clearLoginTimer, failLogin, hostIndex, log, sendEntriesToUi, sendUiEvent],
  );

  const tryNextHost = useCallback(
    (reason: string) => {
      const nextIndex = (hostIndex + 1) % PORTAL_HOSTS.length;
      log("warn", `Portal ${PORTAL_HOSTS[hostIndex]} failed; trying ${PORTAL_HOSTS[nextIndex]}`, {
        reason,
      });
      loginSubmittedRef.current = false;
      setHostIndex(nextIndex);
    },
    [hostIndex, log],
  );

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <WebView
        ref={ui}
        source={{ html: embeddedWebApp, baseUrl: "https://app.local" }}
        style={styles.ui}
        injectedJavaScriptBeforeContentLoaded={uiBridgeScript}
        onMessage={handleUiMessage}
        onError={(event) =>
          log("error", "Mobile interface WebView error", {
            description: event.nativeEvent.description,
          })
        }
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={["*"]}
        allowsBackForwardNavigationGestures
        overScrollMode="never"
      />
      <View pointerEvents="none" style={styles.portalContainer}>
        <WebView
          ref={portal}
          key={PORTAL_HOSTS[hostIndex]}
          source={{ uri: portalUrl(PORTAL_HOSTS[hostIndex]) }}
          injectedJavaScript={portalMonitorScript}
          onMessage={handlePortalMessage}
          onLoadStart={(event) =>
            log("info", "BirchStreet page loading", { url: event.nativeEvent.url })
          }
          onLoadEnd={(event) => {
            log("info", "BirchStreet page loaded", { url: event.nativeEvent.url });
            portal.current?.injectJavaScript(portalMonitorScript);
            portal.current?.injectJavaScript(portalStateScript(loginSubmittedRef.current));
            const credentials = credentialsRef.current;
            if (credentials && loginPendingRef.current && !loginSubmittedRef.current) {
              portal.current?.injectJavaScript(
                loginScript(credentials.loginID, credentials.password),
              );
            }
          }}
          onError={(event) => tryNextHost(event.nativeEvent.description || "network error")}
          onHttpError={(event) => {
            log("error", "BirchStreet HTTP error", {
              statusCode: event.nativeEvent.statusCode,
              url: event.nativeEvent.url,
            });
            if (event.nativeEvent.statusCode >= 500) {
              tryNextHost(`HTTP ${event.nativeEvent.statusCode}`);
            }
          }}
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          setSupportMultipleWindows={false}
          originWhitelist={["https://*"]}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0D1A2D",
  },
  ui: {
    flex: 1,
    backgroundColor: "#F4F6F5",
  },
  portalContainer: {
    position: "absolute",
    width: 1,
    height: 1,
    left: -10,
    bottom: 0,
    opacity: 0.01,
    overflow: "hidden",
  },
});
