package com.labqms.backend.service;

import com.labqms.backend.model.Role;
import com.labqms.backend.model.User;
import com.labqms.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public User login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            return userOpt.get();
        }
        return null;
    }

    private static final String TEACHER_DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzAwQjREOCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiMwQzFCMkEiLz48cGF0aCBkPSJNMTIgMTJjMi4yMSAwIDQtMS43OSA0LTRzLTEuNzktNC00LTQtNCAxLjc5LTQgNCAxLjc5IDQgNCA0em0wIDJjLTIuNjcgMC04IDEuMzQtOCA0djJoMTZ2LTJjMC0yLjY2LTUuMzMtNC04LTR6IiBmaWxsPSIjMDBCNEQ4Ii8+PC9zdmc+";
    private static final String STUDENT_DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzVDRTFFNiI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiMwQzFCMkEiLz48cGF0aCBkPSJNMTIgMTJjMi4yMSAwIDQtMS43OSA0LTRzLTEuNzktNC00LTQtNCAxLjc5LTQgNCAxLjc5IDQgNCA0em0wIDJjLTIuNjcgMC04IDEuMzQtOCA0djJoMTZ2LTJjMC0yLjY2LTUuMzMtNC04LTR6IiBmaWxsPSIjNUNFMUU2Ii8+PC9zdmc+";

    public User register(String name, String email, String password, Role role) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("User with this email already exists.");
        }
        
        String defaultAvatar = role == Role.Teacher ? TEACHER_DEFAULT_AVATAR : STUDENT_DEFAULT_AVATAR;
        
        User newUser = User.builder()
                .id("user-" + UUID.randomUUID().toString().substring(0, 8))
                .name(name)
                .email(email)
                .password(password)
                .role(role)
                .profilePicture(defaultAvatar)
                .build();
        return userRepository.save(newUser);
    }
}
