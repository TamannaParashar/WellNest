package WellNest.WellNest.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import WellNest.WellNest.model.Blog;

public interface BlogRepository extends MongoRepository<Blog, String> {
}
