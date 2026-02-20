package com.labqms.backend.controller;

import com.labqms.backend.model.Role;
import com.labqms.backend.model.User;
import com.labqms.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Allow frontend to connect
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        User user = authService.login(email, password);
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> data) {
        try {
            String name = data.get("name");
            String email = data.get("email");
            String password = data.get("password");
            Role role = Role.valueOf(data.get("role"));
            User user = authService.register(name, email, password, role);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
