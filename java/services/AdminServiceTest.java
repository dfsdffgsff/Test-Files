package com.codejam.codex.authzen.services;

import com.codejam.codex.authzen.dtos.inputs.DelegateRequest;
import com.codejam.codex.authzen.dtos.inputs.RoleRequest;
import com.codejam.codex.authzen.dtos.inputs.RoleUpdateRequest;
import com.codejam.codex.authzen.dtos.outputs.AuditLogResponse;
import com.codejam.codex.authzen.dtos.outputs.UpdateUserResponse;
import com.codejam.codex.authzen.dtos.outputs.UserResponse;
import com.codejam.codex.authzen.models.AuditLog;
import com.codejam.codex.authzen.models.Role;
import com.codejam.codex.authzen.models.User;
import com.codejam.codex.authzen.models.UserRole;
import com.codejam.codex.authzen.repositories.AuditLogRepository;
import com.codejam.codex.authzen.repositories.RoleRepository;
import com.codejam.codex.authzen.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.boot.test.context.SpringBootTest;

import java.sql.Timestamp;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AdminService adminService;

    private User mockUser;
    private Role mockRole;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername("testUser");

        mockRole = new Role();
        mockRole.setName("ROLE_ADMIN");
        mockRole.setDescription("Admin Role");

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(roleRepository.findByName("ROLE_ADMIN")).thenReturn(Collections.singletonList(mockRole));
        when(roleRepository.findByName("ROLE_USER")).thenReturn(Collections.emptyList());
    }


    @Test
    void BUG019() {
        when(userRepository.findById(2L)).thenReturn(Optional.empty());

        RoleUpdateRequest request = new RoleUpdateRequest();
        request.setRoleName("ROLE_ADMIN");

        Exception exception = assertThrows(RuntimeException.class, () -> {
            adminService.updateUserRoles(2L, request, "adminUser");
        });

        assertEquals("User not found", exception.getMessage());
    }


    @Test
    void BUG020() {
        RoleRequest request = new RoleRequest();
        request.setRoleName("ROLE_ADMIN");
        request.setDescription("Admin Role");

        when(roleRepository.existsByName("ROLE_ADMIN")).thenReturn(true);

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            adminService.createRole(request, "adminUser");
        });

        assertEquals("Role already exists", exception.getMessage());
    }

    @Test
    void BUG021() {
        DelegateRequest request = new DelegateRequest();
        request.setUserId(1L);
        request.setRole("ROLE_ADMIN");

        User adminUser = new User();
        adminUser.setUsername("adminUser");
        when(userRepository.findByUsername("adminUser")).thenReturn(Optional.of(adminUser));

        User targetUser = new User();
        targetUser.setUsername("targetUser");
        when(userRepository.findById(1L)).thenReturn(Optional.of(targetUser));

        Role role = new Role();
        role.setName("ROLE_ADMIN");
        when(roleRepository.findByName("ROLE_ADMIN")).thenReturn(List.of(role));

        String result = adminService.delegatePermissions(request, "adminUser");

        assertEquals("Permissions delegated successfully", result);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void BUG022() {
        DelegateRequest request = new DelegateRequest();
        request.setUserId(2L);
        request.setRole("ROLE_ADMIN");

        when(userRepository.findById(2L)).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> {
            adminService.delegatePermissions(request, "adminUser");
        });

        assertEquals("User not found", exception.getMessage());
    }


    @Test
    void BUG023() {
        AuditLog mockLog = new AuditLog();
        mockLog.setId(1L);
        mockLog.setUser(mockUser);
        mockLog.setActionType("User Created");
        mockLog.setTimestamp(new Timestamp(System.currentTimeMillis()));

        when(auditLogRepository.findAll()).thenReturn(Collections.singletonList(mockLog));

        List<AuditLogResponse> auditLogs = adminService.getAuditLogs("adminUser");

        assertNotNull(auditLogs);
        assertEquals(1, auditLogs.size());
        assertEquals("User Created", auditLogs.get(0).getActionType());
    }


    @Test
    void BUG024() {
        when(userRepository.findById(2L)).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> {
            adminService.getUserById(2L);
        });

        assertEquals("User not found with ID: 2", exception.getMessage());
    }
}
