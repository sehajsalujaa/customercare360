package com.cts.repository;

import com.cts.entity.Complaint;
import com.cts.enums.ComplaintCategory;
import com.cts.enums.ComplaintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByComplaintStatus(ComplaintStatus status);
    List<Complaint> findByComplaintCategory(ComplaintCategory category);
    List<Complaint> findByUserUserID(Long userId);

    @Query("SELECT c FROM Complaint c JOIN FETCH c.user WHERE " +
           "(:status IS NULL OR c.complaintStatus = :status) AND " +
           "(:category IS NULL OR c.complaintCategory = :category) AND " +
           "(:fromDate IS NULL OR c.createdAt >= :fromDate) AND " +
           "(:toDate IS NULL OR c.createdAt <= :toDate) " +
           "ORDER BY c.createdAt DESC")
    List<Complaint> filterComplaints(
            @Param("status") ComplaintStatus status,
            @Param("category") ComplaintCategory category,
            @Param("userId") Long userId,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate
    );

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    long countByComplaintStatus(ComplaintStatus status);

    List<Complaint> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT YEAR(c.createdAt), MONTH(c.createdAt), COUNT(c) FROM Complaint c WHERE c.createdAt IS NOT NULL GROUP BY YEAR(c.createdAt), MONTH(c.createdAt) ORDER BY YEAR(c.createdAt), MONTH(c.createdAt)")
    List<Object[]> countComplaintsByMonth();

    @Query("SELECT COUNT(c) FROM Complaint c WHERE " +
           "(:startDate IS NULL OR c.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR c.createdAt <= :endDate)")
    long countFiltered(@Param("startDate") LocalDateTime startDate,
                       @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(c) FROM Complaint c WHERE c.complaintStatus = :status AND " +
           "(:startDate IS NULL OR c.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR c.createdAt <= :endDate)")
    long countFilteredByStatus(@Param("status") ComplaintStatus status,
                               @Param("startDate") LocalDateTime startDate,
                               @Param("endDate") LocalDateTime endDate);

    @Query("SELECT YEAR(c.createdAt), MONTH(c.createdAt), COUNT(c) FROM Complaint c WHERE c.createdAt IS NOT NULL AND " +
           "(:startDate IS NULL OR c.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR c.createdAt <= :endDate) " +
           "GROUP BY YEAR(c.createdAt), MONTH(c.createdAt) ORDER BY YEAR(c.createdAt), MONTH(c.createdAt)")
    List<Object[]> countComplaintsByMonthFiltered(@Param("startDate") LocalDateTime startDate,
                                                   @Param("endDate") LocalDateTime endDate);
}
