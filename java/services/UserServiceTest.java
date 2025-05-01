package com.codejam.codex.authzen.services;

import com.codejam.codex.authzen.dtos.inputs.UpdateUserRequest;
import com.codejam.codex.authzen.dtos.outputs.UpdateUserResponse;
import com.codejam.codex.authzen.dtos.outputs.UserResponse;
import com.codejam.codex.authzen.models.*;
import com.codejam.codex.authzen.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private AutoCloseable closeable;

    @BeforeEach
    void setUp() {
        closeable = MockitoAnnotations.openMocks(this);
    }

    @Test
    void testLoadUserByUsername_Success() {
        User user = new User();
        user.setUsername("john");
        user.setEmail("john@example.com");

        Role role = new Role();
        role.setName("ROLE_USER");

        UserRole userRole = new UserRole();
        userRole.setRole(role);
        user.setUserRoles(Set.of(userRole));

        when(userRepository.findByUsernameOrEmail("john", "john")).thenReturn(Optional.of(user));

        UserResponse response = userService.loadUserByUsername("john");

        assertEquals("john", response.getUsername());
        assertEquals("john@example.com", response.getEmail());
        assertTrue(response.getRoles().contains("ROLE_USER"));
    }

    @Test
    void testLoadUserByUsername_NotFound() {
        when(userRepository.findByUsernameOrEmail("ghost", "ghost")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> userService.loadUserByUsername("ghost"));
    }

    @Test
    void testGetProfile_Success() {
        User user = new User();
        user.setUsername("jane");
        user.setEmail("jane@example.com");

        when(userRepository.findByUsername("jane")).thenReturn(Optional.of(user));
        when(userRepository.findPermissionNamesByUsername("jane")).thenReturn(List.of("READ", "WRITE"));

        UserResponse expectedResponse = UserResponse.fromEntity(user, List.of("READ", "WRITE"));

        UserResponse actualResponse = userService.getProfile("jane");

        assertEquals(expectedResponse.getUsername(), actualResponse.getUsername());
        assertEquals(expectedResponse.getEmail(), actualResponse.getEmail());
        assertEquals(expectedResponse.getPermissions(), actualResponse.getPermissions());
    }

    @Test
    void testGetProfile_NotFound() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> userService.getProfile("ghost"));
    }

    @Test
    void testUpdateUser_Success() {
        User user = new User();
        user.setUsername("john");
        user.setEmail("john@example.com");
        user.setPassword("oldPassword");

        UpdateUserRequest request = new UpdateUserRequest();
        request.setUsername("john_updated");
        request.setEmail("john_updated@example.com");
        request.setPassword("newPassword");

        when(userRepository.findByUsername("john")).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("newPassword")).thenReturn("encodedNewPassword");

        UpdateUserResponse response = userService.updateUser("john", request);

        assertEquals("john_updated", response.getUsername());
        assertEquals("john_updated@example.com", response.getEmail());
        assertEquals("encodedNewPassword", user.getPassword());
    }

    @Test
    void testUpdateUser_NotFound() {
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());

        UpdateUserRequest request = new UpdateUserRequest();
        request.setUsername("anything");

        assertThrows(UsernameNotFoundException.class, () -> userService.updateUser("ghost", request));
    }
}
