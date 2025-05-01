package com.codejam.codex.authzen.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.junit.jupiter.api.Assertions.*;

public class SecurityConfigurationTest {

    @Test
    void BUG032() {
        JwtAuthenticationConverter converter = new SecurityConfiguration().jwtAuthenticationConverter();

        Jwt jwt = Jwt.withTokenValue("fake-token")
                .header("alg", "none")
                .claim("roles", List.of("admin", "user"))
                .build();

        List<GrantedAuthority> authorities =
                (List<GrantedAuthority>) converter.convert(jwt).getAuthorities();

        // Should match "admin" and "user" exactly — NOT "ROLE_admin"
        assertTrue(
                authorities.stream().anyMatch(a -> a.getAuthority().equals("admin")),
                "Expected authority 'admin' not found"
        );
        assertTrue(
                authorities.stream().anyMatch(a -> a.getAuthority().equals("user")),
                "Expected authority 'user' not found"
        );
    }

    @Test
    void BUG034() {
        // Arrange
        SecurityConfiguration config = new SecurityConfiguration();
        String validSecret = "thisisaverysecuresecretkeythatislongenough123";
        ReflectionTestUtils.setField(config, "jwtSecret", validSecret);

        // Act
        JwtDecoder decoder = config.jwtDecoder();

        // Assert
        assertThat(decoder).isInstanceOf(NimbusJwtDecoder.class);
    }

    @Test
    void BUG033() {
        // Arrange
        SecurityConfiguration config = new SecurityConfiguration();
        String shortSecret = "shortsecret";
        ReflectionTestUtils.setField(config, "jwtSecret", shortSecret);

        // Assert
        assertThatThrownBy(config::jwtDecoder,"Key does not ")
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("must be at least 32 bytes");

    }
}
