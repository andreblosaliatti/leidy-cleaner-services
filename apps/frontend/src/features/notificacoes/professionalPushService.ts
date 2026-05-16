import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import {
  PushNotifications,
  type ActionPerformed,
  type PushNotificationSchema,
  type Token,
} from '@capacitor/push-notifications';

import { registrarDispositivoPush } from './notificacoesApi';

type ProfessionalPushSetupOptions = {
  authToken: string;
  navigateTo: (path: string) => void;
};

type PushCleanup = () => Promise<void>;

export async function setupProfessionalPushNotifications({
  authToken,
  navigateTo,
}: ProfessionalPushSetupOptions): Promise<PushCleanup> {
  if (!isAndroidNativeEnvironment()) {
    return async () => undefined;
  }

  const handles: PluginListenerHandle[] = [];
  const cleanup = async () => {
    await Promise.all(handles.map((handle) => handle.remove()));
  };

  try {
    let permission = await PushNotifications.checkPermissions();
    if (permission.receive === 'prompt' || permission.receive === 'prompt-with-rationale') {
      permission = await PushNotifications.requestPermissions();
    }

    if (permission.receive !== 'granted') {
      return cleanup;
    }

    handles.push(
      await PushNotifications.addListener('registration', (token) => {
        void handleRegistration(authToken, token);
      }),
    );
    handles.push(
      await PushNotifications.addListener('registrationError', (error) => {
        logPushWarning('Nao foi possivel registrar notificacoes push.', error);
      }),
    );
    handles.push(
      await PushNotifications.addListener('pushNotificationReceived', (notification) => {
        handleNotificationReceived(notification);
      }),
    );
    handles.push(
      await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        handleNotificationAction(action, navigateTo);
      }),
    );

    await PushNotifications.register();
    return cleanup;
  } catch (error) {
    logPushWarning('Falha ao preparar notificacoes push.', error);
    await cleanup();
    return async () => undefined;
  }
}

function isAndroidNativeEnvironment() {
  return (
    Capacitor.isNativePlatform()
    && Capacitor.getPlatform() === 'android'
    && Capacitor.isPluginAvailable('PushNotifications')
  );
}

async function handleRegistration(authToken: string, pushToken: Token) {
  try {
    await registrarDispositivoPush(authToken, {
      plataforma: 'ANDROID',
      token: pushToken.value,
    });
  } catch (error) {
    logPushWarning('Nao foi possivel salvar este dispositivo para notificacoes.', error);
  }
}

function handleNotificationReceived(_notification: PushNotificationSchema) {
  if (import.meta.env.DEV) {
    console.info('[push] Notificacao recebida no app profissional.');
  }
}

function handleNotificationAction(action: ActionPerformed, navigateTo: (path: string) => void) {
  const data = action.notification.data;
  const conviteId = readPayloadId(data, 'conviteId');
  const atendimentoId = readPayloadId(data, 'atendimentoId');

  if (conviteId) {
    navigateTo(`/profissional/app/convites/${encodeURIComponent(conviteId)}`);
    return;
  }

  if (atendimentoId) {
    navigateTo(`/profissional/app/atendimentos/${encodeURIComponent(atendimentoId)}`);
  }
}

function readPayloadId(data: PushNotificationSchema['data'], key: string) {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const value = data[key];
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}

function logPushWarning(message: string, error?: unknown) {
  if (!import.meta.env.DEV) {
    return;
  }

  const details = error instanceof Error ? error.message : undefined;
  console.warn(`[push] ${message}${details ? ` ${details}` : ''}`);
}
