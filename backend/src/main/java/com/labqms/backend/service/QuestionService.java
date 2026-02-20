package com.labqms.backend.service;

import com.labqms.backend.model.Question;
import com.labqms.backend.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class QuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    public Optional<Question> getQuestionById(String id) {
        return questionRepository.findById(id);
    }

    public Question createQuestion(Question question) {
        if (question.getId() == null || question.getId().isEmpty()) {
            question.setId("q-" + UUID.randomUUID().toString());
        }
        return questionRepository.save(question);
    }

    public Question updateQuestion(String id, Question questionDetails) {
        return questionRepository.findById(id).map(question -> {
            question.setText(questionDetails.getText());
            question.setOptions(questionDetails.getOptions());
            question.setCorrectAnswerIndex(questionDetails.getCorrectAnswerIndex());
            question.setDifficulty(questionDetails.getDifficulty());
            question.setTopic(questionDetails.getTopic());
            question.setType(questionDetails.getType());
            // Update other fields as necessary
            question.setAnswerKey(questionDetails.getAnswerKey());
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
            
            return questionRepository.save(question);
        }).orElseThrow(() -> new RuntimeException("Question not found with id " + id));
    }

    public void deleteQuestion(String id) {
        questionRepository.deleteById(id);
    }
}
