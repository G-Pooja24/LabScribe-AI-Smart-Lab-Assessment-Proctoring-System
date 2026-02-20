package com.labqms.backend.service;

import com.labqms.backend.model.Test;
import com.labqms.backend.repository.TestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class TestService {

    @Autowired
    private TestRepository testRepository;

    public List<Test> getAllTests() {
        return testRepository.findAll();
    }

    public List<Test> getTestsByStudent(String studentId) {
        return testRepository.findByStudentId(studentId);
    }

    public Test submitTest(Test test) {
        // Check for existing submission for this student and paper
        if (test.getStudentId() != null && test.getPaper() != null) {
            List<Test> existingTests = testRepository.findByStudentIdAndPaperId(test.getStudentId(), test.getPaper().getId());
            if (!existingTests.isEmpty()) {
                // Update the existing test instead of creating a new one
                Test existingTest = existingTests.get(0);
                existingTest.setAnswers(test.getAnswers());
                existingTest.setScore(test.getScore());
                existingTest.setSubmittedAt(LocalDateTime.now());
                existingTest.setAiEvaluations(test.getAiEvaluations());
                existingTest.setStatus(test.getStatus()); // Update status
                return testRepository.save(existingTest);
            }
        }

        if (test.getId() == null) {
            test.setId("test-" + UUID.randomUUID().toString().substring(0, 8));
        }
        test.setSubmittedAt(LocalDateTime.now());
        return testRepository.save(test);
    }
}
