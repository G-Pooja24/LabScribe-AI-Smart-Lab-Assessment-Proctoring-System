package com.labqms.backend.service;

import com.labqms.backend.model.BankQuestion;
import com.labqms.backend.repository.BankQuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BankQuestionService {

    @Autowired
    private BankQuestionRepository bankQuestionRepository;

    public List<BankQuestion> getAllQuestions() {
        return bankQuestionRepository.findAll();
    }

    public BankQuestion addQuestion(BankQuestion question) {
        if (question.getId() == null || question.getId().isEmpty()) {
            question.setId("bq-" + java.util.UUID.randomUUID().toString());
        }
        return bankQuestionRepository.save(question);
    }

    public Optional<BankQuestion> getQuestionById(String id) {
        return bankQuestionRepository.findById(id);
    }
    
    public BankQuestion updateQuestion(String id, BankQuestion questionDetails) {
        BankQuestion question = bankQuestionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
        
        question.setText(questionDetails.getText());
        question.setOptions(questionDetails.getOptions());
        question.setCorrectAnswerIndex(questionDetails.getCorrectAnswerIndex());
        question.setAnswerKey(questionDetails.getAnswerKey());
        question.setDifficulty(questionDetails.getDifficulty());
        question.setTopic(questionDetails.getTopic());
        question.setType(questionDetails.getType());
        question.setLanguage(questionDetails.getLanguage());
        question.setMarks(questionDetails.getMarks());
        question.setTitle(questionDetails.getTitle());
        question.setDescription(questionDetails.getDescription());
        question.setInputFormat(questionDetails.getInputFormat());
        question.setOutputFormat(questionDetails.getOutputFormat());
        question.setConstraints(questionDetails.getConstraints());
        question.setSampleInput(questionDetails.getSampleInput());
        question.setSampleOutput(questionDetails.getSampleOutput());
        question.setExplanation(questionDetails.getExplanation());
        question.setMarkingScheme(questionDetails.getMarkingScheme());
        
        return bankQuestionRepository.save(question);
    }

    public void deleteQuestion(String id) {
        bankQuestionRepository.deleteById(id);
    }
}
