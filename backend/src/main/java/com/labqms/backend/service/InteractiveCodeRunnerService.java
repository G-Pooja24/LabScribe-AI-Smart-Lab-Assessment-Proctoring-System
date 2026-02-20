package com.labqms.backend.service;

import com.labqms.backend.model.TerminalMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.*;

@Service
public class InteractiveCodeRunnerService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private final Map<String, Process> activeProcesses = new ConcurrentHashMap<>();
    private final Map<String, BufferedWriter> activeStdins = new ConcurrentHashMap<>();
    private final Map<String, StringBuilder> lineBuffers = new ConcurrentHashMap<>();

    public void startExecution(String studentId, String code, String language) {
        // Kill existing process for this student if any
        stopExecution(studentId);

        String sessionId = studentId;
        Path tempDir = Paths.get(System.getProperty("java.io.tmpdir"), "smartproctor", sessionId);

        try {
            Files.createDirectories(tempDir);
            String fileName = "PYTHON".equalsIgnoreCase(language) ? "script.py" : "Main.java";
            Path sourceFile = tempDir.resolve(fileName);
            Files.writeString(sourceFile, code);

            ProcessBuilder pb;
            if ("PYTHON".equalsIgnoreCase(language)) {
                pb = new ProcessBuilder("python", "-u", fileName); // -u for unbuffered output
            } else {
                // Java needs compilation first
                if (!compileJava(studentId, tempDir)) return;
                pb = new ProcessBuilder("java", "Main");
            }

            pb.directory(tempDir.toFile());
            Process process = pb.start();
            activeProcesses.put(studentId, process);

            BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream()));
            activeStdins.put(studentId, writer);

            // Stream output and error in separate threads
            streamOutput(process.getInputStream(), studentId, "stdout");
            streamOutput(process.getErrorStream(), studentId, "stderr");

            // Monitor process exit
            CompletableFuture.runAsync(() -> {
                try {
                    int exitCode = process.waitFor();
                    messagingTemplate.convertAndSend("/topic/terminal/" + studentId, 
                        TerminalMessage.status("\r\n[Process exited with code " + exitCode + "]\r\n", exitCode));
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    activeProcesses.remove(studentId);
                    activeStdins.remove(studentId);
                    lineBuffers.remove(studentId);
                }
            });

        } catch (Exception e) {
            messagingTemplate.convertAndSend("/topic/terminal/" + studentId, 
                TerminalMessage.output("Internal Error: " + e.getMessage()));
            messagingTemplate.convertAndSend("/topic/terminal/" + studentId, 
                TerminalMessage.status("", -1));
        }
    }

    public void handleInput(String studentId, String input) {
        BufferedWriter writer = activeStdins.get(studentId);
        if (writer == null) return;

        StringBuilder buffer = lineBuffers.computeIfAbsent(studentId, k -> new StringBuilder());

        for (char c : input.toCharArray()) {
            int val = (int) c;
            
            if (val == 13 || val == 10) {
                // Handle Enter key (\r or \n)
                // If the buffer already ends with what we just sent, could be a CRLF sequence
                // However, we process char by char. Standard practice is to consolidate.
                if (buffer.length() > 0 || val == 13) {
                    try {
                        writer.write(buffer.toString() + "\n");
                        writer.flush();
                        messagingTemplate.convertAndSend("/topic/terminal/" + studentId, TerminalMessage.output("\r\n"));
                        buffer.setLength(0);
                    } catch (IOException e) {
                        messagingTemplate.convertAndSend("/topic/terminal/" + studentId, 
                            TerminalMessage.output("\r\n[Input Error: " + e.getMessage() + "]\r\n"));
                    }
                }
            } else if (val == 8 || val == 127) {
                // Handle Backspace (8) or Delete (127)
                if (buffer.length() > 0) {
                    buffer.setLength(buffer.length() - 1);
                    // Visual erase: backspace, space, backspace
                    messagingTemplate.convertAndSend("/topic/terminal/" + studentId, TerminalMessage.output("\b \b"));
                }
            } else if (val >= 32) {
                // Only append printable characters
                buffer.append(c);
                // Visual echo
                messagingTemplate.convertAndSend("/topic/terminal/" + studentId, TerminalMessage.output(String.valueOf(c)));
            }
        }
    }

    public void stopExecution(String studentId) {
        Process p = activeProcesses.remove(studentId);
        if (p != null && p.isAlive()) {
            p.destroyForcibly();
            messagingTemplate.convertAndSend("/topic/terminal/" + studentId, 
                TerminalMessage.status("\r\n[Process terminated]\r\n", -1));
        }
        activeStdins.remove(studentId);
        lineBuffers.remove(studentId);
    }

    private boolean compileJava(String studentId, Path dir) {
        try {
            Process p = new ProcessBuilder("javac", "Main.java").directory(dir.toFile()).start();
            boolean success = p.waitFor(10, TimeUnit.SECONDS);
            if (!success || p.exitValue() != 0) {
                String error = new String(p.getErrorStream().readAllBytes());
                messagingTemplate.convertAndSend("/topic/terminal/" + studentId, 
                    TerminalMessage.output("Compilation Error:\r\n" + error));
                
                // Signal finish even on compilation error
                messagingTemplate.convertAndSend("/topic/terminal/" + studentId, 
                    TerminalMessage.status("", -1));
                return false;
            }
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private void streamOutput(InputStream is, String studentId, String type) {
        CompletableFuture.runAsync(() -> {
            try {
                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = is.read(buffer)) != -1) {
                    if (bytesRead > 0) {
                        String data = new String(buffer, 0, bytesRead);
                        // Normalize line endings for Xterm.js (\n -> \r\n)
                        String formatted = data.replace("\n", "\r\n").replace("\r\r\n", "\r\n");
                        messagingTemplate.convertAndSend("/topic/terminal/" + studentId, 
                            TerminalMessage.output(formatted));
                    }
                }
            } catch (IOException e) {
                // Process likely terminated
            }
        });
    }
}
