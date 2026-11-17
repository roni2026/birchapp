import { useCallback, useRef, useState } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import WebView, { WebViewMessageEvent } from "react-native-webview";
import { embeddedWebApp } from "./native/generatedWebApp";
import {
  BridgeMessage,
  extractOrderEntriesScript,
  loginScript,
  printDetailsScript,
  selectOrderEntryScript,
  uiBridgeScript,
} from "./native/bridge";

const PORTAL_HOSTS = ["app01", "app02", "app03", "app04"];
const portalUrl = (host: string) =>
  `https://${host}.birchstreetsystems.com/j4/login.jsp?subscriberID=458&businessModelID=undefined`;

type Credentials = { loginID: string; password: string };
type PortalEntry = { value: string; label: string };

export default function App() {
  const ui = useRef<WebView>(null);
  const portal = useRef<WebView>(null);
  const [hostIndex, setHostIndex] = useState(0);
  const [credentials, setCredentials] = useState<Credentials | null>(null);

  const sendEntriesToUi = useCallback((entries: PortalEntry[]) => {
    const labels = entries.map((entry) => entry.label);
    ui.current?.injectJavaScript(`
      window.dispatchEvent(new CustomEvent("birchstreet:order-sheet-entries", {
        detail: { entries: ${JSON.stringify(labels)} }
      }));
      true;
    `);
  }, []);

  const handleUiMessage = useCallback((event: WebViewMessageEvent) => {
    let message: BridgeMessage;
    try {
      message = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }

    const detail = message.detail ?? {};
    switch (message.type) {
      case "birchstreet:login": {
        const next = {
          loginID: String(detail.loginID ?? ""),
          password: String(detail.password ?? ""),
        };
        setCredentials(next);
        portal.current?.injectJavaScript(loginScript(next.loginID, next.password));
        break;
      }
      case "birchstreet:refresh":
      case "birchstreet:sync":
        portal.current?.reload();
        break;
      case "birchstreet:request-order-sheet-entries":
        portal.current?.injectJavaScript(extractOrderEntriesScript);
        break;
      case "birchstreet:select-order-sheet-entry":
        portal.current?.injectJavaScript(selectOrderEntryScript(String(detail.entry ?? "")));
        break;
      case "birchstreet:print-with-details":
        portal.current?.injectJavaScript(printDetailsScript(String(detail.documentNumber ?? "")));
        break;
    }
  }, []);

  const handlePortalMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const message = JSON.parse(event.nativeEvent.data) as {
          type: string;
          detail?: { entries?: PortalEntry[] };
        };
        if (message.type === "portal:order-sheet-entries") {
          sendEntriesToUi(message.detail?.entries ?? []);
        }
      } catch {
        // Ignore messages that are not part of the Outrigger bridge.
      }
    },
    [sendEntriesToUi],
  );

  const tryNextHost = useCallback(() => {
    setHostIndex((index) => (index + 1) % PORTAL_HOSTS.length);
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <WebView
        ref={ui}
        source={{ html: embeddedWebApp, baseUrl: "https://app.local" }}
        style={styles.ui}
        injectedJavaScriptBeforeContentLoaded={uiBridgeScript}
        onMessage={handleUiMessage}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={["*"]}
        allowsBackForwardNavigationGestures
        overScrollMode="never"
      />
      <View pointerEvents="none" style={styles.portalContainer}>
        <WebView
          ref={portal}
          source={{ uri: portalUrl(PORTAL_HOSTS[hostIndex]) }}
          onMessage={handlePortalMessage}
          onLoadEnd={() => {
            if (credentials) {
              portal.current?.injectJavaScript(
                loginScript(credentials.loginID, credentials.password),
              );
            }
          }}
          onError={tryNextHost}
          onHttpError={(event) => {
            if (event.nativeEvent.statusCode >= 500) tryNextHost();
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
