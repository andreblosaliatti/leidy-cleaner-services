import { Capacitor } from '@capacitor/core';
import type { PushNotificationSchema } from '@capacitor/push-notifications';

export const PROFESSIONAL_ANDROID_NOTIFICATION_CHANNEL_ID = 'leidy_cleaner_operacional_high';

export type ProfessionalForegroundPushEvent = {
  title: string;
  body: string;
  tipo: string | null;
  conviteId: string | null;
  atendimentoId: string | null;
  targetPath: string | null;
};

const foregroundListeners = new Set<(event: ProfessionalForegroundPushEvent) => void>();

let pendingPushRoute: string | null = null;

export function isNativeAndroidPushEnvironment() {
  return (
    Capacitor.isNativePlatform()
    && Capacitor.getPlatform() === 'android'
    && Capacitor.isPluginAvailable('PushNotifications')
  );
}

export function rememberPendingPushRoute(path: string) {
  pendingPushRoute = path;
}

export function peekPendingPushRoute() {
  return pendingPushRoute;
}

export function clearPendingPushRoute() {
  pendingPushRoute = null;
}

export function subscribeToForegroundPushEvents(listener: (event: ProfessionalForegroundPushEvent) => void) {
  foregroundListeners.add(listener);
  return () => {
    foregroundListeners.delete(listener);
  };
}

export function publishForegroundPushEvent(notification: PushNotificationSchema) {
  const event = toForegroundPushEvent(notification);

  foregroundListeners.forEach((listener) => listener(event));
  return event;
}

export function resolveProfessionalPushRoute(data: unknown) {
  const tipo = readDataValue(data, 'tipo');
  const conviteId = readDataValue(data, 'conviteId');
  const atendimentoId = readDataValue(data, 'atendimentoId');

  if (tipo === 'CONVITE_RECEBIDO' && conviteId) {
    return `/profissional/app/convites/${encodeURIComponent(conviteId)}`;
  }

  if (atendimentoId) {
    return `/profissional/app/atendimentos/${encodeURIComponent(atendimentoId)}`;
  }

  if (conviteId) {
    return `/profissional/app/convites/${encodeURIComponent(conviteId)}`;
  }

  return null;
}

function toForegroundPushEvent(notification: PushNotificationSchema): ProfessionalForegroundPushEvent {
  const tipo = readDataValue(notification.data, 'tipo');
  const conviteId = readDataValue(notification.data, 'conviteId');
  const atendimentoId = readDataValue(notification.data, 'atendimentoId');

  return {
    title: notification.title?.trim() || 'Nova atualizacao operacional',
    body: notification.body?.trim() || 'Voce recebeu uma nova atualizacao no app profissional.',
    tipo,
    conviteId,
    atendimentoId,
    targetPath: resolveProfessionalPushRoute(notification.data),
  };
}

function readDataValue(data: unknown, key: string) {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const value = (data as Record<string, unknown>)[key];

  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return null;
}
