package com.quiz.backend.controller;

import com.quiz.backend.annotation.RoleRequired;
import com.quiz.backend.model.QuizResult;
import com.quiz.backend.model.User;
import com.quiz.backend.repository.QuizResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/result")
@CrossOrigin("*")
public class QuizResultController {

    @Autowired
    private QuizResultRepository resultRepo;

    @GetMapping("/user/{userId}")
    @RoleRequired(User.Role.STUDENT)
    public List<QuizResult> getResults(@PathVariable Long userId) {
        return resultRepo.findByUser_Id(userId);
    }

    // GET ALL (For Admin Performance Monitor)
    @GetMapping
    @RoleRequired(User.Role.ADMIN)
    public List<QuizResult> getAllResults() {
        return resultRepo.findAll();
    }
}