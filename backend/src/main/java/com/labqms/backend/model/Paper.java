package com.labqms.backend.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "papers")
public class Paper {
    @Id
    private String id;
    
    @Lob
    @Column(columnDefinition = "TEXT", nullable = false)
    private String title;
    
    @Lob
    @Column(columnDefinition = "TEXT", nullable = false)
    private String examTitle;
    
    @Lob
    @Column(columnDefinition = "TEXT", nullable = false)
    private String topic;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;
    
    @ManyToMany(cascade = CascadeType.ALL)
    @JoinTable(
        name = "paper_questions",
        joinColumns = @JoinColumn(name = "paper_id"),
        inverseJoinColumns = @JoinColumn(name = "question_id")
    )
    @OrderBy("id ASC")
    private List<Question> questions;
    
    @Column(nullable = false)
    private String teacherId;
    
    private String accessCode;
    
    private int warningLimit;

    private String startTime;
    private String endTime;

    public Paper() {}

    public Paper(String id, String title, String examTitle, String topic, Difficulty difficulty, List<Question> questions, String teacherId, String accessCode, int warningLimit, String startTime, String endTime) {
        this.id = id;
        this.title = title;
        this.examTitle = examTitle;
        this.topic = topic;
        this.difficulty = difficulty;
        this.questions = questions;
        this.teacherId = teacherId;
        this.accessCode = accessCode;
        this.warningLimit = warningLimit;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getExamTitle() { return examTitle; }
    public void setExamTitle(String examTitle) { this.examTitle = examTitle; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public Difficulty getDifficulty() { return difficulty; }
    public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }

    public List<Question> getQuestions() { return questions; }
    public void setQuestions(List<Question> questions) { this.questions = questions; }

    public String getTeacherId() { return teacherId; }
    public void setTeacherId(String teacherId) { this.teacherId = teacherId; }

    public String getAccessCode() { return accessCode; }
    public void setAccessCode(String accessCode) { this.accessCode = accessCode; }

    public int getWarningLimit() { return warningLimit; }
    public void setWarningLimit(int warningLimit) { this.warningLimit = warningLimit; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public static PaperBuilder builder() {
        return new PaperBuilder();
    }

    public static class PaperBuilder {
        private String id;
        private String title;
        private String examTitle;
        private String topic;
        private Difficulty difficulty;
        private List<Question> questions;
        private String teacherId;
        private String accessCode;
        private int warningLimit;
        private String startTime;
        private String endTime;

        public PaperBuilder id(String id) { this.id = id; return this; }
        public PaperBuilder title(String title) { this.title = title; return this; }
        public PaperBuilder examTitle(String examTitle) { this.examTitle = examTitle; return this; }
        public PaperBuilder topic(String topic) { this.topic = topic; return this; }
        public PaperBuilder difficulty(Difficulty diff) { this.difficulty = diff; return this; }
        public PaperBuilder questions(List<Question> questions) { this.questions = questions; return this; }
        public PaperBuilder teacherId(String teacherId) { this.teacherId = teacherId; return this; }
        public PaperBuilder accessCode(String accessCode) { this.accessCode = accessCode; return this; }
        public PaperBuilder warningLimit(int warningLimit) { this.warningLimit = warningLimit; return this; }
        public PaperBuilder startTime(String startTime) { this.startTime = startTime; return this; }
        public PaperBuilder endTime(String endTime) { this.endTime = endTime; return this; }
        public Paper build() {
            return new Paper(id, title, examTitle, topic, difficulty, questions, teacherId, accessCode, warningLimit, startTime, endTime);
        }
    }

}
