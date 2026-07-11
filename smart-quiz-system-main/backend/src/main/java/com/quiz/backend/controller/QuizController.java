package com.quiz.backend.controller;

import com.quiz.backend.annotation.RoleRequired;
import com.quiz.backend.dto.AnswerRequest;
import com.quiz.backend.dto.QuizResultResponse;
import com.quiz.backend.model.QuizSession;
import com.quiz.backend.model.User;
import com.quiz.backend.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/quiz")
@CrossOrigin(origins = "*")
public class QuizController {

    @Autowired
    private QuizService quizService;

    // =========================
    // START QUIZ
    // =========================
    @PostMapping("/start")
    @RoleRequired(User.Role.STUDENT)
    public QuizSession startQuiz(
            @RequestParam Long userId,
            @RequestParam int numberOfQuestions
    ) {
        return quizService.startQuiz(userId, numberOfQuestions);
    }

    // =========================
    // GET SESSION
    // =========================
    @GetMapping("/session/{id}")
    @RoleRequired(User.Role.STUDENT)
    public QuizSession getSession(@PathVariable Long id) {
        return quizService.getSession(id);
    }

    @GetMapping("/status/{sessionId}")
    @RoleRequired(User.Role.STUDENT)
    public QuizSession checkStatus(@PathVariable Long sessionId) {
        return quizService.getSession(sessionId);
    }

    // =========================
    // SUBMIT QUIZ
    // =========================
    @PostMapping("/submit/{sessionId}")
    @RoleRequired(User.Role.STUDENT)
    public QuizResultResponse submitQuiz(
            @PathVariable Long sessionId,
            @RequestBody List<AnswerRequest> answers
    ) {
        return quizService.submitQuiz(sessionId, answers);
    }

    @GetMapping("/test")
    public String test() {
        return "WORKING";
    }
}