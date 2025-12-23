package WellNest.WellNest.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "chat_messages")
public class ChatMessage {

    @Id
    private String id;

    private String trainerEmail;
    private String clientEmail;
    private String sender; // TRAINER or CLIENT
    private String message;
    private LocalDateTime timestamp;

    public ChatMessage() {
        this.timestamp = LocalDateTime.now();
    }

    public ChatMessage(String trainerEmail, String clientEmail, String sender, String message) {
        this.trainerEmail = trainerEmail;
        this.clientEmail = clientEmail;
        this.sender = sender;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public String getTrainerEmail() {
        return trainerEmail;
    }

    public void setTrainerEmail(String trainerEmail) {
        this.trainerEmail = trainerEmail;
    }

    public String getClientEmail() {
        return clientEmail;
    }

    public void setClientEmail(String clientEmail) {
        this.clientEmail = clientEmail;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}
