import { useEffect } from 'react';
import type { NavigateFunction } from 'react-router-dom';

import { setupProfessionalPushNotifications } from './professionalPushService';

type UseProfessionalPushNotificationsOptions = {
  enabled: boolean;
  authToken: string | null;
  navigate: NavigateFunction;
};

export function useProfessionalPushNotifications({
  enabled,
  authToken,
  navigate,
}: UseProfessionalPushNotificationsOptions) {
  useEffect(() => {
    if (!enabled || !authToken) {
      return undefined;
    }

    let cancelled = false;
    let cleanup: (() => Promise<void>) | null = null;

    void setupProfessionalPushNotifications({
      authToken,
      navigateTo: (path) => navigate(path),
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
  }, [authToken, enabled, navigate]);
}
