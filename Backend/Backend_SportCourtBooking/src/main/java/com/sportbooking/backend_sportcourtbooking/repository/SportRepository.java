package com.sportbooking.backend_sportcourtbooking.repository;

import com.sportbooking.backend_sportcourtbooking.entity.Sport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SportRepository extends JpaRepository<Sport, Long> {
    boolean existsByName(String name);

    boolean existsByNameIgnoreCase(String name);

    List<Sport> findByNameContainingIgnoreCase(String name);
}
