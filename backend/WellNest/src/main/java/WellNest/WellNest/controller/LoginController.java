package WellNest.WellNest.controller;
import org.springframework.web.bind.annotation.*;

import WellNest.WellNest.model.LoginEvent;
import WellNest.WellNest.service.LoginService;

@RestController
@RequestMapping("/api/login")
@CrossOrigin(origins = "*")
public class LoginController {
    private final LoginService service;

    public LoginController(LoginService service) {
        this.service = service;
    }

    @PostMapping
    public LoginEvent saveLogin(@RequestBody LoginEvent event) {
        event.setTimestamp(System.currentTimeMillis());
        return service.save(event);
    }
}
