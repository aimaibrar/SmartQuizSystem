package com.quiz.backend.service;

import com.quiz.backend.model.LoginRequest;
import com.quiz.backend.model.LoginResponse;
import com.quiz.backend.model.User;
import com.quiz.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User register(User user) {
        if (userRepository.existsByRegNo(user.getRegNo())) {
            throw new RuntimeException("User with this Reg No already exists");
        }
        return userRepository.save(user);
    }
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByRegNo(request.getRegNo())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Incorrect password");
        }

        return new LoginResponse(
                user.getId(),
                "Login successful",
                user.getRole().name(),
                user.getName(),
                user.getRegNo()
        );
    }

    public User findByRegNo(String regNo) {
        return userRepository.findByRegNo(regNo)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
