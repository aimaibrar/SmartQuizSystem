package com.quiz.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.List;
import java.util.Map;

@Service
public class GroqAiService {

    private final WebClient webClient;

    @Value("${groq.api.key}")
    private String groqApiKey;

    public GroqAiService(WebClient webClient) {
        this.webClient = webClient;
    }

    public String generateQuestions(String topic, int count) {

        String prompt =
                "Generate " + count + " MCQ questions on " + topic +
                        " return ONLY valid JSON array like: " +
                        "[{questionText, optionA, optionB, optionC, optionD, correctAnswer}]";

        try {
            return webClient.post()
                    .uri("https://api.groq.com/openai/v1/chat/completions")
                    .header("Authorization", "Bearer " + groqApiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(Map.of(
                            "model", "llama-3.1-8b-instant",
                            "messages", List.of(
                                    Map.of(
                                            "role", "user",
                                            "content", prompt
                                    )
                            ),
                            "temperature", 0.7
                    ))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (WebClientResponseException e) {
            System.err.println("Groq API Error Response: " + e.getResponseBodyAsString());
            throw new RuntimeException("Groq API Error: " + e.getResponseBodyAsString(), e);
        }
    }
}
