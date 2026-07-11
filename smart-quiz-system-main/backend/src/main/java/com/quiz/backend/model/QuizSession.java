package com.quiz.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
public class QuizSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private LocalDateTime startTime;

    private LocalDateTime expiryTime;

    private boolean submitted = false;

    private boolean completed = false;

    @ManyToMany(fetch = FetchType.EAGER)
    private List<Question> questions;
}