import { useEffect } from 'react';

import { setupProfessionalPushNotifications } from './professionalPushService';

type UseProfessionalPushNotificationsOptions = {
  enabled: boolean;
  userId: number | null;
  authToken: string | null;
};

export function useProfessionalPushNotifications({
  enabled,
  userId,
  authToken,
}: UseProfessionalPushNotificationsOptions) {
  useEffect(() => {
    if (!enabled || !authToken || !userId) {
      return undefined;
    }

    let cancelled = false;
    let cleanup: (() => Promise<void>) | null = null;

    void setupProfessionalPushNotifications({
      authToken,
      userId,
    }).then((registeredCleanup) => {
      if (cancelled) {
        void registeredCleanup();
        return;
      }

      cleanup = registeredCleanup;
    });

    return () => {
      cancelled = true;
      if (cleanup) {
        void cleanup();
      }
    };
  }, [authToken, enabled, userId]);
}
