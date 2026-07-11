package com.quiz.backend.service;

import com.quiz.backend.model.QuizSession;
import com.quiz.backend.repository.QuizSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
public class QuizScheduler {

    @Autowired
    private QuizSessionRepository sessionRepo;

    @Autowired
    private QuizService quizService;

    // Run every 10 seconds to auto-submit expired quizzes
    @Scheduled(fixedDelay = 10000)
    public void autoSubmitExpiredSessions() {
        LocalDateTime now = LocalDateTime.now();
        List<QuizSession> expiredSessions = sessionRepo.findBySubmittedFalseAndExpiryTimeBefore(now);

        if (!expiredSessions.isEmpty()) {
            System.out.println("QuizScheduler: Found " + expiredSessions.size() + " expired unsubmitted sessions. Auto-submitting...");
            for (QuizSession session : expiredSessions) {
                try {
                    // Submit with empty answers list, locking the session and generating final result
                    quizService.submitQuiz(session.getId(), Collections.emptyList());
                    System.out.println("QuizScheduler: Successfully auto-submitted session ID " + session.getId());
                } catch (Exception e) {
                    System.err.println("QuizScheduler: Failed to auto-submit session ID " + session.getId() + ". Error: " + e.getMessage());
                }
            }
        }
    }
}
