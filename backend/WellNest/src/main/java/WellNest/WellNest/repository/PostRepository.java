package WellNest.WellNest.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import WellNest.WellNest.model.Post;

public interface PostRepository extends MongoRepository<Post, String> {
}
