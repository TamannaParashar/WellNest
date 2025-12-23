package WellNest.WellNest.controller;

import WellNest.WellNest.model.ChatMessage;
import WellNest.WellNest.service.ChatService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    // Send message (Trainer or Client)
    @PostMapping
    public ChatMessage sendMessage(@RequestBody ChatMessage message) {
        return chatService.sendMessage(message);
    }

    // Get full chat between trainer & client
    @GetMapping("/{trainerEmail}/{clientEmail}")
    public List<ChatMessage> getChat(
            @PathVariable String trainerEmail,
            @PathVariable String clientEmail
    ) {
        return chatService.getChat(trainerEmail, clientEmail);
    }
}
