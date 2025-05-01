package com.codejam.codex.authzen.services;


import com.codejam.codex.authzen.dtos.inputs.LoginRequest;
import com.codejam.codex.authzen.dtos.inputs.RegisterRequest;
import com.codejam.codex.authzen.dtos.outputs.TokenResponse;
import com.codejam.codex.authzen.dtos.outputs.UserResponse;
import com.codejam.codex.authzen.models.RefreshToken;
import com.codejam.codex.authzen.models.Role;
import com.codejam.codex.authzen.models.User;
import com.codejam.codex.authzen.repositories.RefreshTokenRepository;
import com.codejam.codex.authzen.repositories.RoleRepository;
import com.codejam.codex.authzen.repositories.UserRepository;

import com.codejam.codex.authzen.utils.JwtService;
import org.junit.jupiter.api.*;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private BCryptPasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    @Mock
    private UserService userService;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    private AutoCloseable closeable;

    @BeforeEach
    void setUp() {
        closeable = MockitoAnnotations.openMocks(this);
    }

    @AfterEach
    void tearDown() throws Exception {
        closeable.close();
    }

    @Test
    void testRegisterUser_Success() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setUsername("testuser");
        request.setEmail("test@example.com");
        request.setPassword("password123");

        Role roleUser = new Role();
        roleUser.setName("ROLE_USER");

        when(roleRepository.findByName("ROLE_USER")).thenReturn(List.of(roleUser));
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");

        User savedUser = new User();
        savedUser.setUsername("testuser");
        savedUser.setEmail("test@example.com");
        savedUser.setPassword("encodedPassword");

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        // Act
        UserResponse result = authService.registerUser(request);

        // Assert
        assertNotNull(result);
        assertEquals("testuser", result.getUsername());
        assertEquals("test@example.com", result.getEmail());

        verify(userRepository, times(1)).save(any(User.class));
        verify(roleRepository, times(1)).findByName("ROLE_USER");
    }

    @Test
    void testRegisterUser_EmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest("testuser", "testemail@example.com", "password123");
        User existingUser = new User();
        existingUser.setEmail(request.getEmail());

        Role mockRole = new Role();
        mockRole.setName("ROLE_USER");

        when(roleRepository.findByName("ROLE_USER")).thenReturn(List.of(mockRole));

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(existingUser));

        RuntimeException thrown = assertThrows(RuntimeException.class, () -> {
            authService.registerUser(request);
        });

        assertEquals("Given Details already exists", thrown.getMessage());

        verify(userRepository, times(0)).save(any(User.class));
    }

    @Test
    void testAuthenticateUser_WithCorrectCredentials_ReturnsToken() {
        String email = "student@example.com";
        String rawPassword = "securepassword";
        String encodedPassword = "encoded123";

        User mockUser = new User();
        mockUser.setEmail(email);
        mockUser.setUsername("student");
        mockUser.setPassword(encodedPassword);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches(rawPassword, encodedPassword)).thenReturn(true);
        when(refreshTokenRepository.save(any(RefreshToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0)); // return the same token object

        UserResponse userResponse = new UserResponse();
        userResponse.setEmail(email);
        when(userService.loadUserByUsername(email)).thenReturn(userResponse);

        when(jwtService.generateAccessToken(any())).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any())).thenReturn("refresh-token");

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(rawPassword);

        TokenResponse tokenResponse = authService.authenticateUser(loginRequest);

        assertNotNull(tokenResponse);
        assertEquals("access-token", tokenResponse.getAccessToken());
        assertEquals("refresh-token", tokenResponse.getRefreshToken());
    }
}
