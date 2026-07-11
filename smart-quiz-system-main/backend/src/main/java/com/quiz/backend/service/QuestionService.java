package com.quiz.backend.service;

import com.quiz.backend.model.Question;
import com.quiz.backend.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository repo;

    // ADD QUESTION
    public Question addQuestion(Question q) {
        return repo.save(q);
    }

    // GET ALL QUESTIONS
    public List<Question> getAll() {
        return repo.findAll();
    }

    // GET BY ID
    public Question getById(Long id) {
        return repo.findById(id).orElse(null);
    }

    // DELETE QUESTION
    public void delete(Long id) {
        repo.deleteById(id);
    }
}