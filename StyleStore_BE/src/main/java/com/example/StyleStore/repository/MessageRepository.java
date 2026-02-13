package com.example.StyleStore.repository;

import com.example.StyleStore.model.Message;
import java.util.List;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findBySender_IdAndReceiver_IdOrderByCreatedAtAsc(Long senderId, Long receiverId);

    @Query("""
            SELECT m FROM Message m
            WHERE (m.sender.id = :userId1 AND m.receiver.id = :userId2)
               OR (m.sender.id = :userId2 AND m.receiver.id = :userId1)
            ORDER BY m.createdAt ASC
            """)
    List<Message> findConversation(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    @Modifying
    @Query("""
            UPDATE Message m
            SET m.isRead = true
            WHERE m.sender.id = :senderId
              AND m.receiver.id = :receiverId
              AND m.isRead = false
            """)
    int markReadBetween(@Param("senderId") Long senderId, @Param("receiverId") Long receiverId);

    long countByReceiver_IdAndIsReadFalse(Long receiverId);
}
