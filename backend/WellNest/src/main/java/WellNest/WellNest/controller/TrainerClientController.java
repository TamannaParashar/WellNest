package WellNest.WellNest.controller;

import org.springframework.web.bind.annotation.*;
import WellNest.WellNest.model.TrainerClient;
import WellNest.WellNest.service.TrainerClientService;
import java.util.List;

@RestController
@RequestMapping("/api/trainer-clients")
@CrossOrigin(origins = "*")
public class TrainerClientController {

    private final TrainerClientService service;

    public TrainerClientController(TrainerClientService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public TrainerClient register(@RequestBody TrainerClient client) {
        return service.registerClient(client);
    }

    @GetMapping("/trainer/{email}")
    public List<TrainerClient> getClients(@PathVariable String email) {
        return service.getClientsByTrainerEmail(email);
    }
}
