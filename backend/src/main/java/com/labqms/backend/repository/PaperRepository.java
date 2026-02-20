package com.labqms.backend.repository;

import com.labqms.backend.model.Paper;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaperRepository extends JpaRepository<Paper, String> {
    List<Paper> findByTeacherId(String teacherId);
}
