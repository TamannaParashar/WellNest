package WellNest.WellNest.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import WellNest.WellNest.model.TrainerClient;
import java.util.List;

public interface TrainerClientRepository extends MongoRepository<TrainerClient, String> {
    boolean existsByTrainerEmailAndClientEmail(String trainerEmail, String clientEmail);
    List<TrainerClient> findByTrainerEmail(String trainerEmail);
}
