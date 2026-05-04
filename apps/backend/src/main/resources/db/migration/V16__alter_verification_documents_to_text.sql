-- Alterar colunas de URLs para TEXT para suportar Base64
ALTER TABLE documentos_verificacao
ALTER COLUMN documento_frente_url TYPE TEXT;

ALTER TABLE documentos_verificacao
ALTER COLUMN documento_verso_url TYPE TEXT;

ALTER TABLE documentos_verificacao
ALTER COLUMN selfie_url TYPE TEXT;

ALTER TABLE documentos_verificacao
ALTER COLUMN comprovante_residencia_url TYPE TEXT;