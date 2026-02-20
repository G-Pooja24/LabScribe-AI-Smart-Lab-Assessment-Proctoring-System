package com.labqms.backend.service;

import org.springframework.stereotype.Service;
import java.io.*;
import java.nio.file.*;
import java.util.concurrent.TimeUnit;
import java.util.UUID;

@Service
public class CodeRunnerService {

    public String runCode(String code, String language, String input) {
        if ("PYTHON".equalsIgnoreCase(language)) {
            return runPythonCode(code, input);
        } else {
            return runJavaCode(code, input);
        }
    }

    public String runPythonCode(String code, String input) {
        String sessionId = UUID.randomUUID().toString().substring(0, 8);
        Path tempDir = Paths.get(System.getProperty("java.io.tmpdir"), "smartproctor", sessionId);
        
        try {
            Files.createDirectories(tempDir);
            Path pythonFile = tempDir.resolve("script.py");
            Files.writeString(pythonFile, code);

            // Run Python
            ProcessBuilder pb = new ProcessBuilder("python", "script.py");
            pb.directory(tempDir.toFile());
            Process process = pb.start();

            // Handle Input if present
            if (input != null && !input.isEmpty()) {
                try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(process.getOutputStream()))) {
                    writer.write(input);
                    writer.flush();
                }
            } else {
                process.getOutputStream().close();
            }

            // Wait for process to complete
            boolean finished = process.waitFor(5, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
            }

            // Read output after process finishes or is killed
            String output = readStream(process.getInputStream());
            String errorOutput = readStream(process.getErrorStream());

            if (!finished) {
                return "Execution Timeout: Python code took too long to run.\nOutput so far:\n" + output;
            }

            if (process.exitValue() != 0) {
                return "Runtime Error:\n" + errorOutput;
            }

            return output.isEmpty() ? "Execution successful (no output)." : output;

        } catch (Exception e) {
            return "Internal System Error: " + e.getMessage();
        } finally {
            cleanup(tempDir);
        }
    }

    public String runJavaCode(String code, String input) {
        String sessionId = UUID.randomUUID().toString().substring(0, 8);
        Path tempDir = Paths.get(System.getProperty("java.io.tmpdir"), "smartproctor", sessionId);
        
        try {
            Files.createDirectories(tempDir);
            Path javaFile = tempDir.resolve("Main.java");
            Files.writeString(javaFile, code);

            // Compile
            ProcessBuilder compilePb = new ProcessBuilder("javac", "Main.java");
            compilePb.directory(tempDir.toFile());
            Process compileProcess = compilePb.start();
            
            String compileError = readStream(compileProcess.getErrorStream());
            boolean success = compileProcess.waitFor(10, TimeUnit.SECONDS);

            if (!success || compileProcess.exitValue() != 0) {
                return "Compilation Error:\n" + compileError;
            }

            // Run
            ProcessBuilder runPb = new ProcessBuilder("java", "Main");
            runPb.directory(tempDir.toFile());
            Process runProcess = runPb.start();

            // Handle Input if present
            if (input != null && !input.isEmpty()) {
                try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(runProcess.getOutputStream()))) {
                    writer.write(input);
                    writer.flush();
                }
            } else {
                runProcess.getOutputStream().close();
            }

            // Wait for process
            boolean runSuccess = runProcess.waitFor(5, TimeUnit.SECONDS);
            if (!runSuccess) {
                runProcess.destroyForcibly();
            }

            // Read output
            String output = readStream(runProcess.getInputStream());
            String errorOutput = readStream(runProcess.getErrorStream());

            if (!runSuccess) {
                return "Execution Timeout: Java code took too long to run.\nOutput so far:\n" + output;
            }

            if (runProcess.exitValue() != 0) {
                return "Runtime Error:\n" + errorOutput;
            }

            return output.isEmpty() ? "Execution successful (no output)." : output;

        } catch (Exception e) {
            return "Internal System Error: " + e.getMessage();
        } finally {
            cleanup(tempDir);
        }
    }

    private String readStream(InputStream is) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is))) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
        }
        return sb.toString();
    }

    private void cleanup(Path dir) {
        try {
            if (Files.exists(dir)) {
                Files.walk(dir)
                    .sorted((a, b) -> b.compareTo(a))
                    .map(Path::toFile)
                    .forEach(File::delete);
            }
        } catch (Exception e) {
            System.err.println("Failed to cleanup temp dir: " + e.getMessage());
        }
    }
}
