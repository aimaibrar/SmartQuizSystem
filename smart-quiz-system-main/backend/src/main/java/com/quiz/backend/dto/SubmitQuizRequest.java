package com.quiz.backend.dto;

import java.util.List;

public class SubmitQuizRequest {

    private List<AnswerRequest> answers;

    public List<AnswerRequest> getAnswers() {
        return answers;
    }

    public void setAnswers(List<AnswerRequest> answers) {
        this.answers = answers;
    }
}