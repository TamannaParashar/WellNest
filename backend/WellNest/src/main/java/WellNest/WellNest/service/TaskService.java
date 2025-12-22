package WellNest.WellNest.service;

import WellNest.WellNest.model.Task;
import WellNest.WellNest.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository repository;

    public TaskService(TaskRepository repository) {
        this.repository = repository;
    }

    public Task assignTask(Task task) {
        return repository.save(task);
    }

    public List<Task> getTasksForClient(String clientEmail) {
        return repository.findByClientEmailOrderByCreatedAtDesc(clientEmail);
    }
}
