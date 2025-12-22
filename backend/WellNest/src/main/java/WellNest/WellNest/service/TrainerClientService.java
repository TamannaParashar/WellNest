package WellNest.WellNest.service;

import org.springframework.stereotype.Service;
import WellNest.WellNest.model.TrainerClient;
import WellNest.WellNest.repository.TrainerClientRepository;
import java.util.List;

@Service
public class TrainerClientService {

    private final TrainerClientRepository repository;

    public TrainerClientService(TrainerClientRepository repository) {
        this.repository = repository;
    }

    public TrainerClient registerClient(TrainerClient client) {
        if (repository.existsByTrainerEmailAndClientEmail(client.getTrainerEmail(), client.getClientEmail())) {
            throw new RuntimeException("Client already registered for this trainer");
        }
        return repository.save(client);
    }

    public List<TrainerClient> getClientsByTrainerEmail(String trainerEmail) {
        return repository.findByTrainerEmail(trainerEmail);
    }
}
