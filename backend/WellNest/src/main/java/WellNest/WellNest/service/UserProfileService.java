package WellNest.WellNest.service;

import org.springframework.stereotype.Service;
import WellNest.WellNest.model.UserProfile;
import WellNest.WellNest.repository.UserProfileRepository;

@Service
public class UserProfileService {

    private final UserProfileRepository repo;

    public UserProfileService(UserProfileRepository repo) {
        this.repo = repo;
    }

    public UserProfile save(UserProfile profile) {
        return repo.save(profile);
    }

    public UserProfile findByEmail(String email) {
        return repo.findByEmail(email);
    }
}
