package com.campusconnect.repository;

import com.campusconnect.entity.Club;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ClubRepository extends JpaRepository<Club, Long>, JpaSpecificationExecutor<Club> {

    boolean existsByName(String name);

    long countByActive(boolean active);
}
