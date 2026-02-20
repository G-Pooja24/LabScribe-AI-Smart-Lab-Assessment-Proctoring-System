package com.labqms.backend.controller;

import com.labqms.backend.service.CodeRunnerService;
import com.labqms.backend.service.InteractiveCodeRunnerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/code")
@CrossOrigin(origins = "*")
public class CodeRunnerController {

    @Autowired
    private CodeRunnerService codeRunnerService;

    @Autowired
    private InteractiveCodeRunnerService interactiveCodeRunnerService;

    @PostMapping("/run")
    public String runCode(@RequestBody Map<String, String> request) {
        String code = request.get("code");
        String language = request.get("language");
        String input = request.get("input");
        return codeRunnerService.runCode(code, language, input);
    }

    // WebSocket Message Mappings
    @MessageMapping("/start/{studentId}")
    public void startInteractive(@DestinationVariable String studentId, Map<String, String> payload) {
        String code = payload.get("code");
        String language = payload.get("language");
        interactiveCodeRunnerService.startExecution(studentId, code, language);
    }

    @MessageMapping("/input/{studentId}")
    public void handleInput(@DestinationVariable String studentId, String input) {
        interactiveCodeRunnerService.handleInput(studentId, input);
    }

    @MessageMapping("/stop/{studentId}")
    public void stopExecution(@DestinationVariable String studentId) {
        interactiveCodeRunnerService.stopExecution(studentId);
    }
}
