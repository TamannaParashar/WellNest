package WellNest.WellNest.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import WellNest.WellNest.model.User;

public interface UserRepository extends MongoRepository<User, String> {
    User findByEmail(String email);
}
