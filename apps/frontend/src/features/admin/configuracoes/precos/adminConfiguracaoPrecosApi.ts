import { apiRequest } from '../../../../services/apiClient';
import type { PricingConfiguration, PricingConfigurationUpdatePayload } from './types';

export function getPricingConfiguration(token: string) {
  return apiRequest<PricingConfiguration>('/admin/configuracoes/precos', {
    method: 'GET',
    token,
  });
}

export function updatePricingConfiguration(token: string, payload: PricingConfigurationUpdatePayload) {
  return apiRequest<PricingConfiguration>('/admin/configuracoes/precos', {
    method: 'PUT',
    token,
    body: JSON.stringify(payload),
  });
}
