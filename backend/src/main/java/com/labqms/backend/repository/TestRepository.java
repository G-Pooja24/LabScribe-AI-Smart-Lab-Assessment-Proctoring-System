package com.labqms.backend.repository;

import com.labqms.backend.model.Test;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TestRepository extends JpaRepository<Test, String> {
    List<Test> findByStudentId(String studentId);
    List<Test> findByStudentIdAndPaperId(String studentId, String paperId);
}
