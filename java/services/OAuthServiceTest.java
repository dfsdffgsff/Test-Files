package com.codejam.codex.authzen.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.*;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

class OAuthServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private OAuthService oAuthService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        ReflectionTestUtils.setField(oAuthService, "clientId", "test-client-id");
        ReflectionTestUtils.setField(oAuthService, "clientSecret", "test-client-secret");
        ReflectionTestUtils.setField(oAuthService, "redirectUri", "http://localhost:8080/callback");
        ReflectionTestUtils.setField(oAuthService, "restTemplate", restTemplate);
    }

    @Test
    void BUG025() {
        // Arrange
        String code = "test-code";
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("access_token", "test-access-token");
        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.postForEntity(
                eq("https://github.com/login/oauth/access_token"),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(responseEntity);

        // Act
        String accessToken = oAuthService.getGithubAccessToken(code);

        // Assert
        assertEquals("test-access-token", accessToken);
    }

    @Test
    void BUG026() {
        // Arrange
        String code = "test-code";
        ResponseEntity<Map> responseEntity = new ResponseEntity<>(null, HttpStatus.OK);

        when(restTemplate.postForEntity(
                eq("https://github.com/login/oauth/access_token"),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(responseEntity);

        // Act & Assert
        assertThrows(NullPointerException.class, () -> oAuthService.getGithubAccessToken(code));
    }



    @Test
    void BUG027() {
        // Arrange
        String accessToken = "test-access-token";
        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("login", "testuser");
        responseBody.put("id", 123456);
        ResponseEntity<Map> responseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(
                eq("https://api.github.com/user"),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(responseEntity);

        // Act
        Map<String, Object> user = oAuthService.getGithubUser(accessToken);

        // Assert
        assertNotNull(user);
        assertEquals("testuser", user.get("login"));
        assertEquals(123456, user.get("id"));
    }

    @Test
    void BUG028() {
        // Arrange
        String accessToken = "invalid-token";

        when(restTemplate.exchange(
                eq("https://api.github.com/user"),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenThrow(new HttpClientErrorException(HttpStatus.UNAUTHORIZED));

        // Act & Assert
        assertThrows(HttpClientErrorException.class, () -> oAuthService.getGithubUser(accessToken));
    }

    @Test
    void BUG029() {
        // Arrange
        String accessToken = "test-access-token";
        ResponseEntity<Map> responseEntity = new ResponseEntity<>(null, HttpStatus.OK);

        when(restTemplate.exchange(
                eq("https://api.github.com/user"),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                eq(Map.class)
        )).thenReturn(responseEntity);

        // Act
        Map<String, Object> user = oAuthService.getGithubUser(accessToken);

        // Assert
        assertNull(user);
    }
}