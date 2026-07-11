package com.quiz.backend.service;

import com.quiz.backend.dto.AnswerRequest;
import com.quiz.backend.dto.QuizResultResponse;
import com.quiz.backend.model.Question;
import com.quiz.backend.model.QuizResult;
import com.quiz.backend.model.QuizSession;
import com.quiz.backend.model.User;
import com.quiz.backend.repository.QuestionRepository;
import com.quiz.backend.repository.QuizResultRepository;
import com.quiz.backend.repository.QuizSessionRepository;
import com.quiz.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class QuizService {

    @Autowired
    private QuestionRepository questionRepo;

    @Autowired
    private QuizSessionRepository sessionRepo;

    @Autowired
    private QuizResultRepository resultRepo;

    @Autowired
    private UserRepository userRepo;

    // =========================
    // START QUIZ
    // =========================
    public QuizSession startQuiz(Long userId, int numberOfQuestions) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Question> allQuestions = questionRepo.findAll();
        Collections.shuffle(allQuestions);

        List<Question> selectedQuestions = allQuestions.stream()
                .limit(numberOfQuestions)
                .toList();

        QuizSession session = new QuizSession();
        session.setUser(user);
        session.setStartTime(LocalDateTime.now());
        session.setExpiryTime(LocalDateTime.now().plusMinutes(10));
        session.setSubmitted(false);
        session.setCompleted(false);
        session.setQuestions(selectedQuestions);

        QuizSession saved = sessionRepo.save(session);
        saved.getQuestions().forEach(this::populateShuffledOptions);
        return saved;
    }

    // =========================
    // GET SESSION
    // =========================
    public QuizSession getSession(Long id) {
        QuizSession session = sessionRepo.findById(id).orElse(null);
        if (session != null) {
            session.getQuestions().forEach(this::populateShuffledOptions);
        }
        return session;
    }

    // =========================
    // SUBMIT QUIZ (FINAL + CHEAT PROOF)
    // =========================
    public QuizResultResponse submitQuiz(Long sessionId, List<AnswerRequest> answers) {
        QuizSession session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        // ❌ BLOCK: already submitted
        if (session.isSubmitted()) {
            throw new RuntimeException("Quiz already submitted");
        }

        if (answers == null) {
            answers = Collections.emptyList();
        }

        // ⏰ CHECK: expired quiz
        boolean autoSubmitted = false;
        if (LocalDateTime.now().isAfter(session.getExpiryTime())) {
            autoSubmitted = true;
        }

        List<Question> questions = session.getQuestions();
        Map<Long, Question> questionMap = questions.stream()
                .collect(Collectors.toMap(Question::getId, q -> q));

        int score = 0;
        for (AnswerRequest ans : answers) {
            Question q = questionMap.get(ans.getQuestionId());
            if (q != null && ans.getSelectedAnswer() != null) {
                String correctText = getCorrectAnswerText(q);
                if (correctText != null && correctText.equalsIgnoreCase(ans.getSelectedAnswer().trim())) {
                    score++;
                }
            }
        }

        int total = questions.size();
        double percentage = total == 0 ? 0 : ((double) score / total) * 100;
        String grade = calculateGrade(percentage);

        // =========================
        // SAVE RESULT
        // =========================
        QuizResult result = new QuizResult();
        result.setUser(session.getUser());
        result.setScore(score);
        result.setTotalQuestions(total);
        result.setPercentage(percentage);
        result.setGrade(grade);
        result.setAutoSubmitted(autoSubmitted);
        result.setSubmittedAt(LocalDateTime.now());

        resultRepo.save(result);

        // =========================
        // LOCK SESSION
        // =========================
        session.setSubmitted(true);
        session.setCompleted(true);
        sessionRepo.save(session);

        return new QuizResultResponse(score, total, percentage, grade);
    }

    // =========================
    // HELPERS FOR OPTIONS AND GRADING
    // =========================
    private void populateShuffledOptions(Question q) {
        List<String> options = new ArrayList<>();
        if (q.getOptionA() != null) options.add(q.getOptionA());
        if (q.getOptionB() != null) options.add(q.getOptionB());
        if (q.getOptionC() != null) options.add(q.getOptionC());
        if (q.getOptionD() != null) options.add(q.getOptionD());
        Collections.shuffle(options);
        q.setShuffledOptions(options);
    }

    private String getCorrectAnswerText(Question q) {
        String correct = q.getCorrectAnswer().trim();
        if (correct.equalsIgnoreCase("A")) return q.getOptionA();
        if (correct.equalsIgnoreCase("B")) return q.getOptionB();
        if (correct.equalsIgnoreCase("C")) return q.getOptionC();
        if (correct.equalsIgnoreCase("D")) return q.getOptionD();
        return correct; // If AI output already was option text
    }

    // =========================
    // GRADE SYSTEM
    // =========================
    private String calculateGrade(double percentage) {
        if (percentage >= 90) return "A+";
        else if (percentage >= 80) return "A";
        else if (percentage >= 70) return "B";
        else if (percentage >= 60) return "C";
        else if (percentage >= 50) return "D";
        else return "Fail";
    }
}