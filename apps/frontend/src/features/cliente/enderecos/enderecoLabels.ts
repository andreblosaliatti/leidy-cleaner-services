import type { Endereco } from './types';

export function formatEnderecoResumo(endereco: Endereco) {
  const complemento = endereco.complemento ? `, ${endereco.complemento}` : '';
  return `${endereco.logradouro}, ${endereco.numero}${complemento} - ${endereco.bairro}, ${endereco.cidade}/${endereco.estado}`;
}
