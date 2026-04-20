package com.cts.repository;

import com.cts.entity.Premise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PremiseRepository extends JpaRepository<Premise, Long> {
	Optional<Premise> findByMeterId(String meterId);
}
