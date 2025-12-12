package WellNest.WellNest.controller;

import org.springframework.web.bind.annotation.*;
import WellNest.WellNest.model.UserProfile;
import WellNest.WellNest.service.UserProfileService;

@RestController
@RequestMapping("/api/user-profile")
@CrossOrigin(origins = "*")
public class UserProfileController {

    private final UserProfileService service;

    public UserProfileController(UserProfileService service) {
        this.service = service;
    }

    @GetMapping("/{email}")
    public UserProfile getProfile(@PathVariable String email) {
        UserProfile profile = service.findByEmail(email);
        if (profile == null) {
            throw new RuntimeException("Profile not found for email: " + email);
        }
        return profile;
    }

    @PutMapping("/{email}")
    public UserProfile updateProfile(@PathVariable String email, @RequestBody UserProfile updatedData) {
        UserProfile existing = service.findByEmail(email);
        if (existing == null) {
            updatedData.setEmail(email);
            return service.save(updatedData);
        }

        existing.setName(updatedData.getName());
        existing.setAge(updatedData.getAge());
        existing.setWeight(updatedData.getWeight());
        existing.setHeight(updatedData.getHeight());
        existing.setFitnessGoals(updatedData.getFitnessGoals());

        return service.save(existing);
    }
}
