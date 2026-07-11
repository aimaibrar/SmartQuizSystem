package com.quiz.backend.controller;

import com.quiz.backend.annotation.RoleRequired;
import com.quiz.backend.model.Question;
import com.quiz.backend.model.User;
import com.quiz.backend.service.QuestionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@RoleRequired(User.Role.ADMIN)
@CrossOrigin("*")
public class QuestionController {

    @Autowired
    private QuestionService questionService;

    // ADD QUESTION
    @PostMapping
    public Question add(@Valid @RequestBody Question q) {
        return questionService.addQuestion(q);
    }

    // GET ALL
    @GetMapping
    public List<Question> getAll() {
        return questionService.getAll();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public Question getById(@PathVariable Long id) {
        return questionService.getById(id);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        questionService.delete(id);
    }
}