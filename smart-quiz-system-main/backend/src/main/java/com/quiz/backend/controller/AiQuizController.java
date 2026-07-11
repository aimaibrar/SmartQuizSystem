package com.quiz.backend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quiz.backend.annotation.RoleRequired;
import com.quiz.backend.model.Question;
import com.quiz.backend.model.User;
import com.quiz.backend.repository.QuestionRepository;
import com.quiz.backend.service.GroqAiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/quiz")
@CrossOrigin("*")
@RoleRequired(User.Role.ADMIN)
public class AiQuizController {

    @Autowired
    private GroqAiService aiService;

    @Autowired
    private QuestionRepository questionRepo;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/generate")
    public List<Question> generateQuiz(
            @RequestParam String topic,
            @RequestParam int count
    ) {
        String response = aiService.generateQuestions(topic, count);
        System.out.println("Raw Groq Response: " + response);

        try {
            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode choices = rootNode.get("choices");
            if (choices == null || !choices.isArray() || choices.isEmpty()) {
                throw new RuntimeException("Groq AI Response Error: Missing choices array");
            }

            JsonNode message = choices.get(0).get("message");
            if (message == null || message.get("content") == null) {
                throw new RuntimeException("Groq AI Response Error: Missing message content");
            }

            String content = message.get("content").asText();

            // Extract the clean JSON array string robustly
            int startIndex = content.indexOf('[');
            int endIndex = content.lastIndexOf(']');
            if (startIndex == -1 || endIndex == -1 || endIndex <= startIndex) {
                throw new RuntimeException("Groq AI Response Error: Could not locate JSON array brackets in completion content");
            }

            String jsonArrayString = content.substring(startIndex, endIndex + 1);

            List<Question> generatedQuestions = objectMapper.readValue(
                    jsonArrayString,
                    new TypeReference<List<Question>>() {}
            );

            List<Question> savedQuestions = new ArrayList<>();
            for (Question q : generatedQuestions) {
                if (q.getQuestionText() == null || q.getQuestionText().trim().isEmpty()) {
                    continue; // Skip invalid questions
                }
                // Ensure difficulty is populated
                if (q.getDifficultyLevel() == null || q.getDifficultyLevel().trim().isEmpty()) {
                    q.setDifficultyLevel("medium");
                }
                savedQuestions.add(questionRepo.save(q));
            }

            if (savedQuestions.isEmpty()) {
                throw new RuntimeException("Groq AI generated 0 valid questions");
            }

            return savedQuestions;

        } catch (Exception e) {
            System.err.println("Error parsing Groq AI Response: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to generate and parse AI questions: " + e.getMessage());
        }
    }
}