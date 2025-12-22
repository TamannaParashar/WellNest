package WellNest.WellNest.controller;

import WellNest.WellNest.model.Task;
import WellNest.WellNest.service.TaskService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }

    // Assign a task
    @PostMapping
    public Task assignTask(@RequestBody Task task) {
        return service.assignTask(task);
    }

    // Get tasks for a client
    @GetMapping("/{clientEmail}")
    public List<Task> getTasksForClient(@PathVariable String clientEmail) {
        return service.getTasksForClient(clientEmail);
    }
}
