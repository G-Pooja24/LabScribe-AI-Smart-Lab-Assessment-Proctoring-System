package com.labqms.backend.service;

import com.labqms.backend.model.Paper;
import com.labqms.backend.repository.PaperRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class PaperService {

    @Autowired
    private PaperRepository paperRepository;

    public List<Paper> getAllPapers() {
        return paperRepository.findAll();
    }

    public Optional<Paper> getPaperById(String id) {
        return paperRepository.findById(id);
    }

    public List<Paper> getPapersByTeacher(String teacherId) {
        return paperRepository.findByTeacherId(teacherId);
    }

    public Paper createPaper(Paper paper) {
        if (paper.getId() == null) {
            paper.setId("paper-" + System.currentTimeMillis());
        }
        // Ensure questions also have IDs if they are new
        if (paper.getQuestions() != null) {
            paper.getQuestions().forEach(q -> {
                if (q.getId() == null) {
                    q.setId("q-" + System.currentTimeMillis() + "-" + Math.random());
                }
            });
        }
        return paperRepository.save(paper);
    }
}
