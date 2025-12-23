package WellNest.WellNest.repository;

import WellNest.WellNest.model.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {

    List<ChatMessage> findByTrainerEmailAndClientEmailOrderByTimestampAsc(
            String trainerEmail,
            String clientEmail
    );
}