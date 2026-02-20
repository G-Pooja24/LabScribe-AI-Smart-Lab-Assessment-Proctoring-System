package com.labqms.backend.service;

import com.labqms.backend.model.User;
import com.labqms.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    public User updateProfilePicture(String id, String profilePicture) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        if (profilePicture != null) {
             // Logic to replace with placeholder removed to allow base64 storage
        }
        
        user.setProfilePicture(profilePicture);
        return userRepository.save(user);
    }

    public User updateUser(String id, User updatedUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        if (updatedUser.getName() != null) user.setName(updatedUser.getName());
        if (updatedUser.getProfilePicture() != null) {
            String profilePicture = updatedUser.getProfilePicture();
             // Logic to replace with placeholder removed to allow base64 storage
             user.setProfilePicture(profilePicture);
        }
        
        return userRepository.save(user);
    }

    public void changePassword(String id, String currentPassword, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!user.getPassword().equals(currentPassword)) {
            throw new RuntimeException("Incorrect current password");
        }
        
        user.setPassword(newPassword);
        userRepository.save(user);
    }

    public User uploadProfilePicture(String id, org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        String uploadDir = "uploads/";
        java.io.File directory = new java.io.File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        String originalFilename = file.getOriginalFilename();
        String filename = java.util.UUID.randomUUID().toString() + "_" + originalFilename;
        java.nio.file.Path filePath = java.nio.file.Paths.get(uploadDir + filename);
        java.nio.file.Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

        user.setProfilePicture(filename);
        return userRepository.save(user);
    }
}
