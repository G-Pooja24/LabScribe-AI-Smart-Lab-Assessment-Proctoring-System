package com.labqms.backend.controller;

import com.labqms.backend.model.Paper;
import com.labqms.backend.service.PaperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/papers")
@CrossOrigin(origins = "*")
public class PaperController {

    @Autowired
    private PaperService paperService;

    @GetMapping
    public List<Paper> getPapers(@RequestParam(required = false) String teacherId) {
        if (teacherId != null) {
            return paperService.getPapersByTeacher(teacherId);
        }
        return paperService.getAllPapers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Paper> getPaperById(@PathVariable String id) {
        return paperService.getPaperById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Paper> createPaper(@RequestBody Paper paper) {
        return ResponseEntity.ok(paperService.createPaper(paper));
    }
}
