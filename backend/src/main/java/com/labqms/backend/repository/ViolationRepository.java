package com.labqms.backend.repository;

import com.labqms.backend.model.Violation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ViolationRepository extends JpaRepository<Violation, Long> {
    List<Violation> findByPaperId(String paperId);
    List<Violation> findByStudentIdAndPaperId(String studentId, String paperId);
}
