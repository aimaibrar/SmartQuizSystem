package com.quiz.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
@Entity
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Question text is required")
    @Column(nullable = false, length = 1000)
    private String questionText;

    @NotBlank(message = "Option A is required")
    @Column(nullable = false)
    private String optionA;

    @NotBlank(message = "Option B is required")
    @Column(nullable = false)
    private String optionB;

    @NotBlank(message = "Option C is required")
    @Column(nullable = false)
    private String optionC;

    @NotBlank(message = "Option D is required")
    @Column(nullable = false)
    private String optionD;

    @NotBlank(message = "Correct answer is required")
    @Column(nullable = false)
    private String correctAnswer;

    @NotBlank(message = "Difficulty level is required")
    @Column(nullable = false)
    private String difficultyLevel;

    @Transient
    private List<String> shuffledOptions;

    public Question() {}
}