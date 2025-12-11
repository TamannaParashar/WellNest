package WellNest.WellNest.controller;

import org.springframework.web.bind.annotation.*;
import WellNest.WellNest.model.User;
import WellNest.WellNest.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @PostMapping
    public User saveUser(@RequestBody User user) {
        user.setTimestamp(System.currentTimeMillis());
        return service.save(user);
    }
    @PutMapping("/{email}")
        public User updateUser(
                @PathVariable String email,
                @RequestBody User updatedData
        ) {
            User existing = service.findByEmail(email);

            if (existing == null) {
                throw new RuntimeException("User not found: " + email);
            }
    existing.setName(updatedData.getName());
    existing.setAge(updatedData.getAge());
    existing.setHeight(updatedData.getHeight());
    existing.setWeight(updatedData.getWeight());
    existing.setFitnessGoals(updatedData.getFitnessGoals());

    return service.save(existing);
}
@GetMapping("/{email}")
public User getUserByEmail(@PathVariable String email) {
    User user = service.findByEmail(email);
    if (user == null) {
        throw new RuntimeException("User not found: " + email);
    }
    return user;
}

}
