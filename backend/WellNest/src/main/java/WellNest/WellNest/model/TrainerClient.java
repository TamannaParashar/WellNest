package WellNest.WellNest.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "trainer_clients")
public class TrainerClient {

    @Id
    private String id;

    private String trainerId;
    private String trainerName;
    private String trainerEmail;
    private String trainerPhone;
    private String trainerTitle;
    private String trainerBio;
    private String trainerExpertise;      
    private String trainerCertification;  
    private String clientEmail;
    private LocalDateTime registeredAt;

    public TrainerClient() {
        this.registeredAt = LocalDateTime.now();
    }

    public TrainerClient(String trainerId, String trainerName, String trainerEmail, String trainerPhone,
                         String trainerTitle, String trainerBio, String trainerExpertise, String trainerCertification,
                         String clientEmail) {
        this.trainerId = trainerId;
        this.trainerName = trainerName;
        this.trainerEmail = trainerEmail;
        this.trainerPhone = trainerPhone;
        this.trainerTitle = trainerTitle;
        this.trainerBio = trainerBio;
        this.trainerExpertise = trainerExpertise;
        this.trainerCertification = trainerCertification;
        this.clientEmail = clientEmail;
        this.registeredAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTrainerId() { return trainerId; }
    public void setTrainerId(String trainerId) { this.trainerId = trainerId; }

    public String getTrainerName() { return trainerName; }
    public void setTrainerName(String trainerName) { this.trainerName = trainerName; }

    public String getTrainerEmail() { return trainerEmail; }
    public void setTrainerEmail(String trainerEmail) { this.trainerEmail = trainerEmail; }

    public String getTrainerPhone() { return trainerPhone; }
    public void setTrainerPhone(String trainerPhone) { this.trainerPhone = trainerPhone; }

    public String getTrainerTitle() { return trainerTitle; }
    public void setTrainerTitle(String trainerTitle) { this.trainerTitle = trainerTitle; }

    public String getTrainerBio() { return trainerBio; }
    public void setTrainerBio(String trainerBio) { this.trainerBio = trainerBio; }

    public String getTrainerExpertise() { return trainerExpertise; }
    public void setTrainerExpertise(String trainerExpertise) { this.trainerExpertise = trainerExpertise; }

    public String getTrainerCertification() { return trainerCertification; }
    public void setTrainerCertification(String trainerCertification) { this.trainerCertification = trainerCertification; }

    public String getClientEmail() { return clientEmail; }
    public void setClientEmail(String clientEmail) { this.clientEmail = clientEmail; }

    public LocalDateTime getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(LocalDateTime registeredAt) { this.registeredAt = registeredAt; }
}