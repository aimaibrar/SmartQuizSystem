package com.quiz.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private Long id;
    private String message;
    private String role;
    private String name;
    private String regNo;
}