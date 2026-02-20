package com.labqms.backend.model;

public class TerminalMessage {
    private String type; // "output" or "status"
    private String content;
    private Integer exitCode;

    public TerminalMessage() {
    }

    public TerminalMessage(String type, String content, Integer exitCode) {
        this.type = type;
        this.content = content;
        this.exitCode = exitCode;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Integer getExitCode() {
        return exitCode;
    }

    public void setExitCode(Integer exitCode) {
        this.exitCode = exitCode;
    }

    public static TerminalMessage output(String content) {
        return new TerminalMessage("output", content, null);
    }

    public static TerminalMessage status(String content, Integer exitCode) {
        return new TerminalMessage("status", content, exitCode);
    }
}
