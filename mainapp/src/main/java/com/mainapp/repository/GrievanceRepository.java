package com.mainapp.repository;

import com.mainapp.model.Grievance;
import com.mainapp.model.GrievanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GrievanceRepository extends JpaRepository<Grievance, Long> {

    List<Grievance> findAllByOrderByCreatedAtDesc();

    List<Grievance> findByDealerIdOrderByCreatedAtDesc(Long dealerId);

    List<Grievance> findByCitizenIdOrderByCreatedAtDesc(Long citizenId);

    List<Grievance> findByStatusOrderByCreatedAtDesc(GrievanceStatus status);
}
