package com.labqms.backend.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "questions")
public class Question {
    @Id
    private String id;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String text;
    
    @ElementCollection
    @CollectionTable(name = "question_options", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "option_text")
    private List<String> options;
    
    private Integer correctAnswerIndex;
    
    @Column(columnDefinition = "TEXT")
    private String answerKey;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;
    
    @Column(nullable = false)
    private String topic;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType type;

    @Enumerated(EnumType.STRING)
    private CodeLanguage language;
    
    private Integer marks;
    
    @Column(columnDefinition = "TEXT")
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String inputFormat;
    
    @Column(columnDefinition = "TEXT")
    private String outputFormat;
    
    @Column(columnDefinition = "TEXT")
    private String constraints;
    
    @Column(columnDefinition = "TEXT")
    private String sampleInput;
    
    @Column(columnDefinition = "TEXT")
    private String sampleOutput;
    
    @Column(columnDefinition = "TEXT")
    private String explanation;
    
    @Column(columnDefinition = "TEXT")
    private String markingScheme;

    public Question() {}

    public Question(String id, String text, List<String> options, Integer correctAnswerIndex, String answerKey, Difficulty difficulty, String topic, QuestionType type, CodeLanguage language, Integer marks, String title, String description, String inputFormat, String outputFormat, String constraints, String sampleInput, String sampleOutput, String explanation, String markingScheme) {
        this.id = id;
        this.text = text;
        this.options = options;
        this.correctAnswerIndex = correctAnswerIndex;
        this.answerKey = answerKey;
        this.difficulty = difficulty;
        this.topic = topic;
        this.type = type;
        this.language = language;
        this.marks = marks;
        this.title = title;
        this.description = description;
        this.inputFormat = inputFormat;
        this.outputFormat = outputFormat;
        this.constraints = constraints;
        this.sampleInput = sampleInput;
        this.sampleOutput = sampleOutput;
        this.explanation = explanation;
        this.markingScheme = markingScheme;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }

    public Integer getCorrectAnswerIndex() { return correctAnswerIndex; }
    public void setCorrectAnswerIndex(Integer correctAnswerIndex) { this.correctAnswerIndex = correctAnswerIndex; }

    public String getAnswerKey() { return answerKey; }
    public void setAnswerKey(String answerKey) { this.answerKey = answerKey; }

    public Difficulty getDifficulty() { return difficulty; }
    public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public QuestionType getType() { return type; }
    public void setType(QuestionType type) { this.type = type; }

    public CodeLanguage getLanguage() { return language; }
    public void setLanguage(CodeLanguage language) { this.language = language; }

    public Integer getMarks() { return marks; }
    public void setMarks(Integer marks) { this.marks = marks; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getInputFormat() { return inputFormat; }
    public void setInputFormat(String inputFormat) { this.inputFormat = inputFormat; }

    public String getOutputFormat() { return outputFormat; }
    public void setOutputFormat(String outputFormat) { this.outputFormat = outputFormat; }

    public String getConstraints() { return constraints; }
    public void setConstraints(String constraints) { this.constraints = constraints; }

    public String getSampleInput() { return sampleInput; }
    public void setSampleInput(String sampleInput) { this.sampleInput = sampleInput; }

    public String getSampleOutput() { return sampleOutput; }
    public void setSampleOutput(String sampleOutput) { this.sampleOutput = sampleOutput; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getMarkingScheme() { return markingScheme; }
    public void setMarkingScheme(String markingScheme) { this.markingScheme = markingScheme; }

    public static QuestionBuilder builder() {
        return new QuestionBuilder();
    }

    public static class QuestionBuilder {
        private String id;
        private String text;
        private List<String> options;
        private Integer correctAnswerIndex;
        private String answerKey;
        private Difficulty difficulty;
        private String topic;
        private QuestionType type;
        private CodeLanguage language;
        private Integer marks;
        private String title;
        private String description;
        private String inputFormat;
        private String outputFormat;
        private String constraints;
        private String sampleInput;
        private String sampleOutput;
        private String explanation;
        private String markingScheme;

        public QuestionBuilder id(String id) { this.id = id; return this; }
        public QuestionBuilder text(String text) { this.text = text; return this; }
        public QuestionBuilder options(List<String> options) { this.options = options; return this; }
        public QuestionBuilder correctAnswerIndex(Integer index) { this.correctAnswerIndex = index; return this; }
        public QuestionBuilder answerKey(String key) { this.answerKey = key; return this; }
        public QuestionBuilder difficulty(Difficulty diff) { this.difficulty = diff; return this; }
        public QuestionBuilder topic(String topic) { this.topic = topic; return this; }
        public QuestionBuilder type(QuestionType type) { this.type = type; return this; }
        public QuestionBuilder language(CodeLanguage language) { this.language = language; return this; }
        public QuestionBuilder marks(Integer marks) { this.marks = marks; return this; }
        public QuestionBuilder title(String title) { this.title = title; return this; }
        public QuestionBuilder description(String desc) { this.description = desc; return this; }
        public QuestionBuilder inputFormat(String format) { this.inputFormat = format; return this; }
        public QuestionBuilder outputFormat(String format) { this.outputFormat = format; return this; }
        public QuestionBuilder constraints(String constraints) { this.constraints = constraints; return this; }
        public QuestionBuilder sampleInput(String input) { this.sampleInput = input; return this; }
        public QuestionBuilder sampleOutput(String output) { this.sampleOutput = output; return this; }
        public QuestionBuilder explanation(String exp) { this.explanation = exp; return this; }
        public QuestionBuilder markingScheme(String scheme) { this.markingScheme = scheme; return this; }
        public Question build() {
            return new Question(id, text, options, correctAnswerIndex, answerKey, difficulty, topic, type, language, marks, title, description, inputFormat, outputFormat, constraints, sampleInput, sampleOutput, explanation, markingScheme);
        }
    }
}
