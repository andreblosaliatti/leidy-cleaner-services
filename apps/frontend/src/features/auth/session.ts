import type { TipoUsuario, UsuarioAutenticado } from './types';

export function getDashboardPath(user: Pick<UsuarioAutenticado, 'tipoUsuario' | 'roles'>) {
  if (isAdminUser(user)) {
    return '/app/admin';
  }

  if (user.tipoUsuario === 'PROFISSIONAL') {
    return '/app/profissional';
  }

  return '/app/cliente';
}

export function isAdminUser(user: Pick<UsuarioAutenticado, 'tipoUsuario' | 'roles'>) {
  return user.tipoUsuario === 'ADMIN' || user.roles.includes('ROLE_ADMIN') || user.roles.includes('ADMIN');
}

export function canAccessProfile(user: Pick<UsuarioAutenticado, 'tipoUsuario' | 'roles'>, profile: TipoUsuario) {
  if (profile === 'ADMIN') {
    return isAdminUser(user);
  }

  return user.tipoUsuario === profile;
}

export function getFirstName(nomeCompleto: string) {
  return nomeCompleto.trim().split(/\s+/)[0] || 'usuário';
}

export function getProfileLabel(tipoUsuario: TipoUsuario) {
  const labels: Record<TipoUsuario, string> = {
    ADMIN: 'Admin',
    CLIENTE: 'Cliente',
    PROFISSIONAL: 'Profissional',
  };

  return labels[tipoUsuario];
}
