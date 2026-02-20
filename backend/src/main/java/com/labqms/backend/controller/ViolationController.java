package com.labqms.backend.controller;

import com.labqms.backend.model.Violation;
import com.labqms.backend.repository.ViolationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/violations")
public class ViolationController {

    @Autowired
    private ViolationRepository violationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping
    public Violation logViolation(@RequestBody Violation violation) {
        violation.setTimestamp(LocalDateTime.now());
        Violation saved = violationRepository.save(violation);
        
        // Broadcast to teacher topic
        // Assuming we follow a topic pattern: /topic/proctoring/{paperId}
        messagingTemplate.convertAndSend("/topic/proctoring/" + violation.getPaperId(), saved);
        
        return saved;
    }

    @GetMapping("/paper/{paperId}")
    public List<Violation> getByPaper(@PathVariable String paperId) {
        return violationRepository.findByPaperId(paperId);
    }
    
    @MessageMapping("/violation")
    public void handleWebSocketViolation(@Payload Violation violation) {
        violation.setTimestamp(LocalDateTime.now());
        Violation saved = violationRepository.save(violation);
        messagingTemplate.convertAndSend("/topic/proctoring/" + violation.getPaperId(), saved);
    }
}
