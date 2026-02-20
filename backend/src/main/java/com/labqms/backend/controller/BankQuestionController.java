package com.labqms.backend.controller;

import com.labqms.backend.model.BankQuestion;
import com.labqms.backend.service.BankQuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bank-questions")
@CrossOrigin(origins = "*")
public class BankQuestionController {

    @Autowired
    private BankQuestionService bankQuestionService;

    @GetMapping
    public List<BankQuestion> getAllQuestions() {
        return bankQuestionService.getAllQuestions();
    }

    @PostMapping
    public BankQuestion addQuestion(@RequestBody BankQuestion question) {
        return bankQuestionService.addQuestion(question);
    }
    
    @PutMapping("/{id}")
    public BankQuestion updateQuestion(@PathVariable String id, @RequestBody BankQuestion question) {
        return bankQuestionService.updateQuestion(id, question);
    }

    @DeleteMapping("/{id}")
    public void deleteQuestion(@PathVariable String id) {
        bankQuestionService.deleteQuestion(id);
    }
}
