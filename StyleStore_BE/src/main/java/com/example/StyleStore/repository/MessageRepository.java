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

        interface ChatUserProjection {
                Long getId();

                String getFullName();

                String getEmail();
        }

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

        @Query(value = """
                        SELECT DISTINCT
                                u.id AS id,
                                u.full_name AS fullName,
                                u.email AS email
                        FROM messages m
                        JOIN users u ON u.id = CASE
                                WHEN m.sender_user_id = :currentUserId THEN m.receiver_user_id
                                ELSE m.sender_user_id
                        END
                        WHERE m.sender_user_id = :currentUserId OR m.receiver_user_id = :currentUserId
                        """, nativeQuery = true)
        List<ChatUserProjection> findDistinctChatUsers(@Param("currentUserId") Long currentUserId);
}
