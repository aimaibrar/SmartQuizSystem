package com.quiz.backend.security;

import com.quiz.backend.annotation.RoleRequired;
import com.quiz.backend.model.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class RoleSecurityInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        RoleRequired roleRequired = handlerMethod.getMethodAnnotation(RoleRequired.class);
        if (roleRequired == null) {
            roleRequired = handlerMethod.getBeanType().getAnnotation(RoleRequired.class);
        }

        if (roleRequired != null) {
            String roleHeader = request.getHeader("X-User-Role");
            if (roleHeader == null || roleHeader.trim().isEmpty()) {
                throw new RuntimeException("Access Denied: Missing X-User-Role header");
            }

            try {
                User.Role userRole = User.Role.valueOf(roleHeader.toUpperCase());
                if (userRole != roleRequired.value()) {
                    throw new RuntimeException("Access Denied: Insufficient privileges. Required role: " + roleRequired.value());
                }
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Access Denied: Invalid user role '" + roleHeader + "'");
            }
        }

        return true;
    }
}
