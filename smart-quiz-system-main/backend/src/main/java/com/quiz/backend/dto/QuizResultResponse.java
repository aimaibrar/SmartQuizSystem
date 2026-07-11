package com.quiz.backend.dto;

public class QuizResultResponse {

    private int score;
    private int total;
    private double percentage;
    private String grade;

    public QuizResultResponse(int score, int total, double percentage, String grade) {
        this.score = score;
        this.total = total;
        this.percentage = percentage;
        this.grade = grade;
    }

    public int getScore() {
        return score;
    }

    public int getTotal() {
        return total;
    }

    public double getPercentage() {
        return percentage;
    }

    public String getGrade() {
        return grade;
    }
}