import { useNativePushNotificationBindings } from '../notificacoes/useNativePushNotificationBindings';
import { useAndroidBackButtonHandler } from './useAndroidBackButtonHandler';
import { useProfessionalAppSessionGuard } from './useProfessionalAppSessionGuard';

export function NativePlatformBindings() {
  useAndroidBackButtonHandler();
  useNativePushNotificationBindings();
  useProfessionalAppSessionGuard();
  return null;
}
