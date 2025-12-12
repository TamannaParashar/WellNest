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
}
