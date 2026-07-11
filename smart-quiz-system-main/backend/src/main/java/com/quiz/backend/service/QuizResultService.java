package com.quiz.backend.service;

import com.quiz.backend.model.QuizResult;
import com.quiz.backend.repository.QuizResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class QuizResultService {

    @Autowired
    private QuizResultRepository quizResultRepository;

    public QuizResult saveResult(QuizResult result) {

        double percentage =
                (result.getScore() * 100.0)
                        / result.getTotalQuestions();

        result.setPercentage(percentage);

        if (percentage >= 90)
            result.setGrade("A+");

        else if (percentage >= 80)
            result.setGrade("A");

        else if (percentage >= 70)
            result.setGrade("B");

        else if (percentage >= 60)
            result.setGrade("C");

        else
            result.setGrade("Fail");

        result.setSubmittedAt(LocalDateTime.now());

        return quizResultRepository.save(result);
    }
}