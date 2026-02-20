package com.labqms.backend.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum CodeLanguage {
    JAVA("java"),
    PYTHON("python"),
    C("c"),
    CPP("cpp");

    private final String value;

    CodeLanguage(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
    
    @com.fasterxml.jackson.annotation.JsonCreator
    public static CodeLanguage fromValue(String value) {
        for (CodeLanguage lang : CodeLanguage.values()) {
            if (lang.value.equalsIgnoreCase(value)) {
                return lang;
            }
        }
        return null;
    }
}
