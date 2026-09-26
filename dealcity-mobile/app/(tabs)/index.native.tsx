import WebView, { type WebView as WebViewRef } from 'react-native-webview';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SITE_URL } from '@/services/api';

const siteOrigin = new URL(SITE_URL).origin;

// The site's own responsive navigation and cookie session remain in one WebView.
const navigationBridge = `
  (function () {
    if (window.__dealcityBridge) return;
    window.__dealcityBridge = true;
    document.addEventListener('click', function (event) {
      var anchor = event.target && event.target.closest && event.target.closest('a[href]');
      if (!anchor) return;
      var url = anchor.href;
      if (/^(https:\/\/(wa\.me|api\.whatsapp\.com|(?:www\.)?whatsapp\.com)\/|whatsapp:|tel:|mailto:)/i.test(url)) {
        event.preventDefault();
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'external', url: url }));
      } else if (anchor.target === '_blank' && new URL(url, location.href).origin === location.origin) {
        event.preventDefault();
        location.assign(url);
      }
    }, true);
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
  })();
  true;
`;

export default function DealCityApp() {
  const webview = useRef<WebViewRef>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      if (error) return false;
      webview.current?.injectJavaScript('window.history.back(); true;');
      return true;
    });
    return () => listener.remove();
  }, [error]);

  useEffect(() => {
    if (!loading) return;
    const timeout = setTimeout(() => { setLoading(false); setError(true); }, 20000);
    return () => clearTimeout(timeout);
  }, [loading]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webview}
        style={styles.webview}
        source={{ uri: siteOrigin }}
        injectedJavaScript={navigationBridge}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        onError={() => { setLoading(false); setError(true); }}
        onMessage={({ nativeEvent }) => {
          try {
            const message = JSON.parse(nativeEvent.data);
            if (message.type === 'ready') { setLoading(false); setError(false); return; }
            if (message.type === 'external' && typeof message.url === 'string' && /^(https:\/\/(wa\.me|api\.whatsapp\.com|(?:www\.)?whatsapp\.com)\/|whatsapp:|tel:|mailto:)/i.test(message.url)) {
              void Linking.openURL(message.url);
            }
          } catch { /* Ignore messages from other site scripts. */ }
        }}
        onRenderProcessGone={() => setError(true)}
        onContentProcessDidTerminate={() => webview.current?.reload()}
      />
      {loading && !error && <View style={styles.overlay}><ActivityIndicator size="large" color="#4a90e2" /><Text style={styles.text}>Chargement de DealCity…</Text></View>}
      {error && <View style={styles.overlay}><Text style={styles.text}>Impossible d’afficher DealCity.</Text><TouchableOpacity onPress={() => { setError(false); setLoading(true); webview.current?.reload(); }}><Text style={styles.action}>Réessayer</Text></TouchableOpacity></View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  webview: { flex: 1 },
  overlay: { position: 'absolute', inset: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', gap: 14 },
  text: { color: '#374151', fontSize: 16 },
  action: { color: '#2563eb', fontWeight: '700', padding: 12 },
});
