INSERT INTO roles (nome)
SELECT 'ROLE_ADMIN'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE nome = 'ROLE_ADMIN'
);

INSERT INTO usuarios (
    nome_completo,
    email,
    telefone,
    senha_hash,
    tipo_usuario,
    status_conta,
    email_verificado,
    telefone_verificado
)
SELECT
    'Administrador Local',
    'admin@leidycleaner.local',
    '+5551000000000',
    '$2b$10$N6XS28O2BHTMjEj/aTWBSePU6ZEHT/QAPaLbpXVFylkEyeOjUAxVi',
    'ADMIN',
    'ATIVA',
    TRUE,
    TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios WHERE email = 'admin@leidycleaner.local'
);

INSERT INTO usuario_roles (usuario_id, role_id)
SELECT u.id, r.id
FROM usuarios u
JOIN roles r ON r.nome = 'ROLE_ADMIN'
WHERE u.email = 'admin@leidycleaner.local'
  AND NOT EXISTS (
      SELECT 1
      FROM usuario_roles ur
      WHERE ur.usuario_id = u.id
        AND ur.role_id = r.id
  );
