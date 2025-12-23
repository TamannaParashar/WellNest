package WellNest.WellNest.service;

import WellNest.WellNest.model.ChatMessage;
import WellNest.WellNest.repository.ChatMessageRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;

    public ChatService(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    public ChatMessage sendMessage(ChatMessage message) {
        return chatMessageRepository.save(message);
    }

    public List<ChatMessage> getChat(String trainerEmail, String clientEmail) {
        return chatMessageRepository
                .findByTrainerEmailAndClientEmailOrderByTimestampAsc(trainerEmail, clientEmail);
    }
}
