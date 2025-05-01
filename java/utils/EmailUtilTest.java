package com.codejam.codex.authzen.utils;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class EmailUtilTest {

    @Mock
    private JavaMailSender javaMailSender;

    @InjectMocks
    private EmailUtil emailUtil;

    private final String toEmail = "test@example.com";
    private final String subject = "Reset Your Password";
    private final String body = "Click here to reset: ${RESET_LINK}";
    private final String resetLink = "http://reset-link.com";

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        // Set the value for the @Value injected field manually (reflection)
        try {
            java.lang.reflect.Field fromField = EmailUtil.class.getDeclaredField("fromEmail");
            fromField.setAccessible(true);
            fromField.set(emailUtil, "noreply@codejam.com");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Test
    void BUG030() {
        doThrow(new MailException("Error") {}).when(javaMailSender).send(any(SimpleMailMessage.class));

        boolean result = emailUtil.sendPasswordResetEmail(toEmail, subject, body, resetLink);

        assertFalse(result);
    }

    @Test
    void BUG031() throws Exception {
        when(javaMailSender.createMimeMessage()).thenThrow(new MailException("Mime error") {});

        boolean result = emailUtil.sendPasswordResetEmailHtml(toEmail, subject, body, resetLink);

        assertFalse(result);
    }
}