package com.mainapp.repository;

import com.mainapp.model.RestockRequest;
import com.mainapp.model.RestockRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestockRequestRepository extends JpaRepository<RestockRequest, Long> {

    List<RestockRequest> findByStatusOrderByCreatedAtDesc(RestockRequestStatus status);

    List<RestockRequest> findByDealerIdOrderByCreatedAtDesc(Long dealerId);

    List<RestockRequest> findAllByOrderByCreatedAtDesc();
}
