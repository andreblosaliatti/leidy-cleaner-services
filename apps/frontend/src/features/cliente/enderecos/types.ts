export type Endereco = {
  id: number;
  usuarioId: number;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  latitude: number | null;
  longitude: number | null;
  principal: boolean;
  criadoEm: string;
};

export type EnderecoRequest = {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  latitude?: number | null;
  longitude?: number | null;
  principal?: boolean;
};
