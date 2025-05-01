package com.codejam.codex.authzen.security;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

@TestConfiguration
public class OverrideControllersConfig {

    @Bean
    @Primary
    public DummyAuthController dummyAuthController() {
        return new DummyAuthController();
    }

    @RestController
    @RequestMapping("/api/authenticate/auth")
    public static class DummyAuthController {

        @PostMapping("/reset-request")
        public ResponseEntity<String> resetRequest() {
            return ResponseEntity.ok("Dummy Reset Request OK");
        }

        @PostMapping("/reset-password")
        public ResponseEntity<String> resetPassword() {
            return ResponseEntity.ok("Dummy Reset Password OK");
        }
    }
}
