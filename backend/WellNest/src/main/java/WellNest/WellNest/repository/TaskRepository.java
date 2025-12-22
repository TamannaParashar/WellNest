package WellNest.WellNest.repository;

import WellNest.WellNest.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {

    // Get all tasks for a client
    List<Task> findByClientEmailOrderByCreatedAtDesc(String clientEmail);
}
