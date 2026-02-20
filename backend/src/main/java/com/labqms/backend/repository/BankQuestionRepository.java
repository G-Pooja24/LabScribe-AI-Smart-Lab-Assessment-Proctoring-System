package com.labqms.backend.repository;

import com.labqms.backend.model.BankQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BankQuestionRepository extends JpaRepository<BankQuestion, String> {
}
