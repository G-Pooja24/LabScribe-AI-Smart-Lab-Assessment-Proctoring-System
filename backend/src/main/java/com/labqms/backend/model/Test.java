package com.labqms.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "tests")
public class Test {
    @Id
    private String id;
    
    @ManyToOne
    @JoinColumn(name = "paper_id", nullable = false)
    private Paper paper;
    
    @Column(nullable = false)
    private String studentName;
    
    @Column(nullable = false)
    private String studentId;
    
    @ElementCollection
    @CollectionTable(name = "test_answers", joinColumns = @JoinColumn(name = "test_id"))
    @Column(name = "answer_text", columnDefinition = "LONGTEXT")
    private List<String> answers;
    
    private double score;
    
    private LocalDateTime submittedAt;

    @Column(columnDefinition = "LONGTEXT")
    private String aiEvaluations;

    @Column(nullable = false)
    private String status = "IN_PROGRESS"; // Default status

    public Test() {}

    public Test(String id, Paper paper, String studentName, String studentId, List<String> answers, double score, LocalDateTime submittedAt, String aiEvaluations, String status) {
        this.id = id;
        this.paper = paper;
        this.studentName = studentName;
        this.studentId = studentId;
        this.answers = answers;
        this.score = score;
        this.submittedAt = submittedAt;
        this.aiEvaluations = aiEvaluations;
        this.status = status;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Paper getPaper() { return paper; }
    public void setPaper(Paper paper) { this.paper = paper; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public List<String> getAnswers() { return answers; }
    public void setAnswers(List<String> answers) { this.answers = answers; }

    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }

    public String getAiEvaluations() { return aiEvaluations; }
    public void setAiEvaluations(String aiEvaluations) { this.aiEvaluations = aiEvaluations; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public static TestBuilder builder() {
        return new TestBuilder();
    }

    public static class TestBuilder {
        private String id;
        private Paper paper;
        private String studentName;
        private String studentId;
        private List<String> answers;
        private double score;
        private LocalDateTime submittedAt;
        private String aiEvaluations;
        private String status;

        public TestBuilder id(String id) { this.id = id; return this; }
        public TestBuilder paper(Paper paper) { this.paper = paper; return this; }
        public TestBuilder studentName(String name) { this.studentName = name; return this; }
        public TestBuilder studentId(String id) { this.studentId = id; return this; }
        public TestBuilder answers(List<String> answers) { this.answers = answers; return this; }
        public TestBuilder score(double score) { this.score = score; return this; }
        public TestBuilder submittedAt(LocalDateTime time) { this.submittedAt = time; return this; }
        public TestBuilder aiEvaluations(String aiEvaluations) { this.aiEvaluations = aiEvaluations; return this; }
        public TestBuilder status(String status) { this.status = status; return this; }
        public Test build() {
            return new Test(id, paper, studentName, studentId, answers, score, submittedAt, aiEvaluations, status);
        }
    }
}
