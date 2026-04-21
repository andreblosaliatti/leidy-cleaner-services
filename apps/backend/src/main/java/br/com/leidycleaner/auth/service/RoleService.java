package br.com.leidycleaner.auth.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.leidycleaner.auth.entity.Role;
import br.com.leidycleaner.auth.entity.RoleName;
import br.com.leidycleaner.auth.repository.RoleRepository;

@Service
public class RoleService {

    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Transactional(readOnly = true)
    public List<Role> listarRolesBase() {
        return roleRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Role buscarObrigatoria(RoleName nome) {
        return roleRepository.findByNome(nome)
                .orElseThrow(() -> new IllegalStateException("Role base nao encontrada: " + nome));
    }
}
