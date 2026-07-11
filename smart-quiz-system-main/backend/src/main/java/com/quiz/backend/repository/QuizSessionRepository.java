package com.quiz.backend.repository;

import com.quiz.backend.model.QuizSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface QuizSessionRepository extends JpaRepository<QuizSession, Long> {
    List<QuizSession> findBySubmittedFalseAndExpiryTimeBefore(LocalDateTime time);
}