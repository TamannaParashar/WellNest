package WellNest.WellNest.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import WellNest.WellNest.model.Comment;

import java.util.List;

public interface CommentRepository extends MongoRepository<Comment, String> {
    List<Comment> findBySourceIdAndSourceType(String sourceId, String sourceType);
}
