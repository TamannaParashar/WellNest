package WellNest.WellNest.repository;
import org.springframework.data.mongodb.repository.MongoRepository;

import WellNest.WellNest.model.LoginEvent;
public interface LoginRepository extends MongoRepository<LoginEvent, String> {
}