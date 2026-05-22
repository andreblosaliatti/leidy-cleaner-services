import { useEffect } from 'react';
import { PushNotifications, type ActionPerformed, type Channel } from '@capacitor/push-notifications';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/useAuth';
import { isProfessionalAppUser } from '../native/professionalApp';
import {
  PROFESSIONAL_ANDROID_NOTIFICATION_CHANNEL_ID,
  clearPendingPushRoute,
  isNativeAndroidPushEnvironment,
  peekPendingPushRoute,
  rememberPendingPushRoute,
  resolveProfessionalPushRoute,
} from './pushNotificationRouting';

const operationalHighPriorityChannel: Channel = {
  id: PROFESSIONAL_ANDROID_NOTIFICATION_CHANNEL_ID,
  name: 'Chamados e convites',
  description: 'Notificacoes de convites, chamados e atendimentos',
  importance: 5,
  visibility: 1,
  sound: 'default',
  vibration: true,
  lights: true,
};

let notificationChannelCreated = false;

export function useNativePushNotificationBindings() {
  const { status, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isNativeAndroidPushEnvironment()) {
      return undefined;
    }

    let cancelled = false;
    let removeActionListener: (() => Promise<void>) | undefined;

    async function setupNativeBindings() {
      try {
        if (!notificationChannelCreated) {
          await PushNotifications.createChannel(operationalHighPriorityChannel);
          notificationChannelCreated = true;
        }
      } catch (error) {
        logPushWarning('Nao foi possivel criar o canal de notificacoes do app profissional.', error);
      }

      try {
        const actionListener = await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          handlePushAction(action, navigate);
        });

        if (cancelled) {
          void actionListener.remove();
          return;
        }

        removeActionListener = () => actionListener.remove();
      } catch (error) {
        logPushWarning('Nao foi possivel preparar a abertura do app a partir das notificacoes.', error);
      }
    }

    void setupNativeBindings();

    return () => {
      cancelled = true;

      if (removeActionListener) {
        void removeActionListener();
      }
    };
  }, [navigate]);

  useEffect(() => {
    const pendingRoute = peekPendingPushRoute();

    if (!pendingRoute) {
      return;
    }

    if (status === 'authenticated' && isProfessionalAppUser(user)) {
      if (`${location.pathname}${location.search}` !== pendingRoute) {
        navigate(pendingRoute, { replace: true });
      }

      clearPendingPushRoute();
      return;
    }

    if (location.pathname === '/entrar') {
      const redirectTo = new URLSearchParams(location.search).get('redirectTo');

      if (redirectTo === pendingRoute) {
        clearPendingPushRoute();
        return;
      }
    }

    if (status === 'anonymous' && `${location.pathname}${location.search}` === pendingRoute) {
      clearPendingPushRoute();
    }
  }, [location.pathname, location.search, navigate, status, user]);
}

function handlePushAction(action: ActionPerformed, navigate: ReturnType<typeof useNavigate>) {
  const targetPath = resolveProfessionalPushRoute(action.notification.data);

  if (!targetPath) {
    return;
  }

  rememberPendingPushRoute(targetPath);
  navigate(targetPath, { replace: false });
}

function logPushWarning(message: string, error?: unknown) {
  if (!import.meta.env.DEV) {
    return;
  }

  const details = error instanceof Error ? error.message : undefined;
  console.warn(`[push] ${message}${details ? ` ${details}` : ''}`);
}
