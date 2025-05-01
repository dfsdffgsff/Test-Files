package com.codejam.codex.authzen.utils;

import com.codejam.codex.authzen.dtos.outputs.UserResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private UserResponse mockUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();

        // Set private fields via reflection
        ReflectionTestUtils.setField(jwtService, "jwtSecret", "a_secure_key_that_is_long_enough_to_be_valid!!");
        ReflectionTestUtils.setField(jwtService, "accessTokenExpiry", 1000 * 60 * 10);  // 10 minutes
        ReflectionTestUtils.setField(jwtService, "refreshTokenExpiry", 1000 * 60 * 60 * 24); // 24 hours
        jwtService.validateSecretLength();

        mockUser = new UserResponse();
        mockUser.setId(1L);
        mockUser.setUsername("testuser");
        mockUser.setRoles(Set.of("ROLE_USER"));
        mockUser.setPermissions(List.of("READ_PRIVILEGES", "WRITE_PRIVILEGES"));
    }

    @Test
    void BUG002() {
        String token = jwtService.generateAccessToken(mockUser);

        assertNotNull(token);
        assertTrue(jwtService.isTokenValid(token, mockUser));
        assertEquals("testuser", jwtService.extractUsername(token));
        assertFalse(jwtService.isTokenExpired(token));
    }

    @Test
    void BUG003() {
        String refreshToken = jwtService.generateRefreshToken(mockUser);
        assertNotNull(refreshToken);
        assertTrue(jwtService.isTokenValid(refreshToken));
    }

    @Test
    void BUG004() {
        String token = jwtService.generateAccessToken(mockUser);
        List<String> permissions = jwtService.extractPermissions(token);
        assertEquals(List.of("READ_PRIVILEGES", "WRITE_PRIVILEGES"), permissions);
    }

    @Test
    void BUG005() {
        String token = jwtService.generateAccessToken(mockUser);
        assertFalse(jwtService.isTokenBlacklisted(token));
        jwtService.blacklistToken(token);
        assertTrue(jwtService.isTokenBlacklisted(token));
    }

    @Test
    void BUG006() {
        String token = jwtService.generateAccessToken(mockUser);
        Date expiration = jwtService.extractExpiration(token);
        assertTrue(expiration.after(new Date()));
    }

    @Test
    void BUG007() {
        String invalidToken = "invalid.token.value";
        assertFalse(jwtService.isTokenValid(invalidToken));
    }

    @Test
    void BUG008() {
        String token = jwtService.generateAccessToken(mockUser);

        UserResponse anotherUser = new UserResponse();
        anotherUser.setUsername("otheruser");
        assertFalse(jwtService.isTokenValid(token, anotherUser));
    }

    @Test
    void BUG009() throws InterruptedException {
        ReflectionTestUtils.setField(jwtService, "accessTokenExpiry", 1); // 1 ms
        String token = jwtService.generateAccessToken(mockUser);
        Thread.sleep(5); // Ensure token expires
        assertTrue(jwtService.extractExpiration(token).before(new Date()));
        assertFalse(jwtService.isTokenValid(token, mockUser));
    }
}
