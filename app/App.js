import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const SITE_URL = Constants.expoConfig?.extra?.siteUrl;
const API_URL = Constants.expoConfig?.extra?.apiUrl;

function normalizeUrl(value) {
  if (!value) {
    return SITE_URL;
  }

  if (value.startsWith('/')) {
    return `${SITE_URL.replace(/\/$/, '')}${value}`;
  }

  if (value.startsWith(SITE_URL)) {
    return value;
  }

  return SITE_URL;
}

async function getPushToken() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Geral',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const currentPermission =
    await Notifications.getPermissionsAsync();

  let finalStatus = currentPermission.status;

  if (finalStatus !== 'granted') {
    const requestedPermission =
      await Notifications.requestPermissionsAsync();

    finalStatus = requestedPermission.status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId =
    Constants.easConfig?.projectId ??
    Constants.expoConfig?.extra?.eas?.projectId;

  if (!projectId || projectId.startsWith('COLOQUE-')) {
    console.log('EAS projectId não configurado.');
    return null;
  }

  const token = (
    await Notifications.getExpoPushTokenAsync({
      projectId,
    })
  ).data;

  console.log('EXPO PUSH TOKEN:', token);

  return token;
}

async function registerPushToken(jwt, pushToken) {
  if (!jwt || !pushToken || !API_URL) {
    return false;
  }

  try {
    const endpoint = `${API_URL}/push/register`;

    console.log('Registrando push token em:', endpoint);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        token: pushToken,
        plataforma: Platform.OS,
        device: Device.modelName,
      }),
    });

    const responseText = await response.text();

    console.log('PUSH REGISTER STATUS:', response.status);
    console.log('PUSH REGISTER OK:', response.ok);
    console.log('PUSH REGISTER RESPONSE:', responseText);
    console.log('PUSH TOKEN:', pushToken);
    console.log('PLATAFORMA:', Platform.OS);
    console.log('DEVICE:', Device.modelName);
    console.log('JWT:', jwt);

    if (!response.ok) {
      console.log(
        'Erro ao registrar push token:',
        response.status,
        responseText
      );

      return false;
    }

    return true;
  } catch (error) {
    console.log('ERRO FETCH PUSH REGISTER:', error);

    return false;
  }
}

async function unregisterPushToken(jwt, pushToken) {
  if (!jwt || !pushToken || !API_URL) {
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/push/unregister`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          token: pushToken,
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();

      console.log(
        'Erro ao remover push token:',
        response.status,
        text
      );
    }
  } catch (error) {
    console.log('Erro ao remover push token:', error);
  }
}

function MainApp() {
  const webViewRef = useRef(null);
  const pushTokenRef = useRef(null);
  const authTokenRef = useRef(null);
  const registeredRef = useRef(null);

  const [url, setUrl] = useState(SITE_URL);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loadingError, setLoadingError] = useState(false);

  async function tryRegisterPushToken() {
    const jwt = authTokenRef.current;
    const pushToken = pushTokenRef.current;

    if (!jwt || !pushToken) {
      return;
    }

    const registerKey = `${jwt}:${pushToken}`;

    if (registeredRef.current === registerKey) {
      return;
    }

    try {
      const registered = await registerPushToken(
        jwt,
        pushToken
      );

      if (registered) {
        registeredRef.current = registerKey;
      }
    } catch (error) {
      console.log('Erro ao registrar push token:', error);
    }
  }

  async function handleWebViewMessage(event) {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'LOGIN') {
        if (!data.token) {
          return;
        }

        authTokenRef.current = data.token;

        await tryRegisterPushToken();

        return;
      }

      if (data.type === 'LOGOUT') {
        const jwt =
          data.token ||
          authTokenRef.current;

        const pushToken =
          pushTokenRef.current;

        await unregisterPushToken(
          jwt,
          pushToken
        );

        authTokenRef.current = null;
        registeredRef.current = null;
      }
    } catch (error) {
      console.log(
        'Erro ao receber mensagem da WebView:',
        error
      );
    }
  }

  useEffect(() => {
    getPushToken()
      .then(async (token) => {
        if (!token) {
          return;
        }

        pushTokenRef.current = token;

        await tryRegisterPushToken();
      })
      .catch((error) => {
        console.log(
          'Erro ao obter push token:',
          error
        );
      });

    const notificationSubscription =
      Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const notificationUrl =
            response.notification.request.content.data?.url;

          if (typeof notificationUrl === 'string') {
            setUrl(
              normalizeUrl(notificationUrl)
            );
          }
        }
      );

    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        const notificationUrl =
          response?.notification.request.content.data?.url;

        if (typeof notificationUrl === 'string') {
          setUrl(
            normalizeUrl(notificationUrl)
          );
        }
      })
      .catch(console.error);

    return () => {
      notificationSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return undefined;
    }

    const subscription =
      BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (canGoBack) {
            webViewRef.current?.goBack();

            return true;
          }

          return false;
        }
      );

    return () => {
      subscription.remove();
    };
  }, [canGoBack]);

  function handleNavigation(request) {
    const requestUrl = request.url;

    if (
      requestUrl.startsWith(SITE_URL) ||
      requestUrl === 'about:blank'
    ) {
      return true;
    }

    Linking.openURL(requestUrl)
      .catch(console.error);

    return false;
  }

  function reload() {
    setLoadingError(false);

    webViewRef.current?.reload();
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={styles.container}
        edges={['top', 'bottom']}
      >
        <StatusBar style="dark" />

        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          startInLoadingState
          onMessage={handleWebViewMessage}
          onShouldStartLoadWithRequest={
            handleNavigation
          }
          onNavigationStateChange={(state) => {
            setCanGoBack(state.canGoBack);
          }}
          onLoadStart={() => {
            setLoadingError(false);
          }}
          onError={() => {
            setLoadingError(true);
          }}
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" />
            </View>
          )}
        />

        {loadingError && (
          <View style={styles.error}>
            <Text style={styles.errorTitle}>
              Não foi possível carregar o site.
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={reload}
            >
              <Text style={styles.buttonText}>
                Tentar novamente
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },

  error: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },

  errorTitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },

  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#111827',
  },

  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default MainApp;