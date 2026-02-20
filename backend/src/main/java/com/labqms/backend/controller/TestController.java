package com.labqms.backend.controller;

import com.labqms.backend.model.Test;
import com.labqms.backend.service.TestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tests")
@CrossOrigin(origins = "*")
public class TestController {

    @Autowired
    private TestService testService;

    @GetMapping
    public List<Test> getTests(@RequestParam(required = false) String studentId) {
        if (studentId != null) {
            return testService.getTestsByStudent(studentId);
        }
        return testService.getAllTests();
    }

    @PostMapping
    public ResponseEntity<Test> submitTest(@RequestBody Test test) {
        return ResponseEntity.ok(testService.submitTest(test));
    }
}
