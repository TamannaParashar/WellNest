package WellNest.WellNest.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import WellNest.WellNest.model.UserProfile;

public interface UserProfileRepository extends MongoRepository<UserProfile, String> {
    UserProfile findByEmail(String email);
}
