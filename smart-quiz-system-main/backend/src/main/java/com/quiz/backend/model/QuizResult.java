package com.quiz.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
public class QuizResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private int score;

    private int totalQuestions;

    private double percentage;

    private String grade;

    private boolean autoSubmitted;

    private LocalDateTime submittedAt;

    public QuizResult() {}
}