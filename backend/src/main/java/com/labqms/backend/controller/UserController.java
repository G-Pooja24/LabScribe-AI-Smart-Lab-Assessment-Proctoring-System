package com.labqms.backend.controller;

import com.labqms.backend.model.User;
import com.labqms.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @PutMapping("/{id}/profile-picture")
    public ResponseEntity<?> updateProfilePicture(@PathVariable String id, @RequestBody Map<String, String> data) {
        try {
            String profilePicture = data.get("profilePicture");
            if (profilePicture == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "profilePicture is required"));
            }
            User updatedUser = userService.updateProfilePicture(id, profilePicture);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody User user) {
        try {
            User updatedUser = userService.updateUser(id, user);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable String id, @RequestBody Map<String, String> passwords) {
        try {
            String currentPassword = passwords.get("currentPassword");
            String newPassword = passwords.get("newPassword");
            userService.changePassword(id, currentPassword, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    @PostMapping("/{id}/profile-picture/upload")
    public ResponseEntity<?> uploadProfilePicture(@PathVariable String id, @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            User updatedUser = userService.uploadProfilePicture(id, file);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
