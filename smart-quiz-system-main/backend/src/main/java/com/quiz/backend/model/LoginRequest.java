package com.quiz.backend.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Registration number is required")
    private String regNo;

    @NotBlank(message = "Password is required")
    private String password;
}
