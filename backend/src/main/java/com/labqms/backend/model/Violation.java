package com.labqms.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "violations")
public class Violation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String studentId;
    
    @Column(nullable = false)
    private String studentName;
    
    @Column(nullable = false)
    private String paperId;
    
    @Column(nullable = false)
    private String violationType; // e.g., "TAB_SWITCH", "FOCUS_LOSS", "FULLSCREEN_EXIT"
    
    @Column(columnDefinition = "TEXT")
    private String details;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;

    public Violation() {}

    public Violation(String studentId, String studentName, String paperId, String violationType, String details, LocalDateTime timestamp) {
        this.studentId = studentId;
        this.studentName = studentName;
        this.paperId = paperId;
        this.violationType = violationType;
        this.details = details;
        this.timestamp = timestamp;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getPaperId() { return paperId; }
    public void setPaperId(String paperId) { this.paperId = paperId; }

    public String getViolationType() { return violationType; }
    public void setViolationType(String violationType) { this.violationType = violationType; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
