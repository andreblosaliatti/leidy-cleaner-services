import type { PluginListenerHandle } from '@capacitor/core';
import {
  PushNotifications,
  type PushNotificationSchema,
  type Token,
} from '@capacitor/push-notifications';

import { registrarDispositivoPush } from './notificacoesApi';
import { isNativeAndroidPushEnvironment, publishForegroundPushEvent } from './pushNotificationRouting';

type ProfessionalPushSetupOptions = {
  authToken: string;
  userId: number;
};

type PushCleanup = () => Promise<void>;
type RegisteredPushTarget = {
  userId: number;
  pushToken: string;
};

let lastRegisteredPushTarget: RegisteredPushTarget | null = null;
let pendingPushRegistrationKey: string | null = null;

export async function setupProfessionalPushNotifications({
  authToken,
  userId,
}: ProfessionalPushSetupOptions): Promise<PushCleanup> {
  if (!isNativeAndroidPushEnvironment()) {
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
        void handleRegistration(authToken, userId, token);
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

    await PushNotifications.register();
    return cleanup;
  } catch (error) {
    logPushWarning('Falha ao preparar notificacoes push.', error);
    await cleanup();
    return async () => undefined;
  }
}

async function handleRegistration(authToken: string, userId: number, pushToken: Token) {
  const pushRegistrationKey = `${userId}:${pushToken.value}`;

  if (lastRegisteredPushTarget?.userId === userId && lastRegisteredPushTarget.pushToken === pushToken.value) {
    return;
  }

  if (pendingPushRegistrationKey === pushRegistrationKey) {
    return;
  }

  pendingPushRegistrationKey = pushRegistrationKey;

  try {
    await registrarDispositivoPush(authToken, {
      plataforma: 'ANDROID',
      token: pushToken.value,
    });
    lastRegisteredPushTarget = {
      userId,
      pushToken: pushToken.value,
    };
  } catch (error) {
    logPushWarning('Nao foi possivel salvar este dispositivo para notificacoes.', error);
  } finally {
    if (pendingPushRegistrationKey === pushRegistrationKey) {
      pendingPushRegistrationKey = null;
    }
  }
}

function handleNotificationReceived(notification: PushNotificationSchema) {
  publishForegroundPushEvent(notification);

  if (import.meta.env.DEV) {
    console.info('[push] Notificacao recebida no app profissional.');
  }
}

function logPushWarning(message: string, error?: unknown) {
  if (!import.meta.env.DEV) {
    return;
  }

  const details = error instanceof Error ? error.message : undefined;
  console.warn(`[push] ${message}${details ? ` ${details}` : ''}`);
}
