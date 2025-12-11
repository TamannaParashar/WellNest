package WellNest.WellNest.service;

import org.springframework.stereotype.Service;
import WellNest.WellNest.model.User;
import WellNest.WellNest.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository repo;

    public UserService(UserRepository repo) {
        this.repo = repo;
    }

    public User save(User user) {
        return repo.save(user);
    }
    public User findByEmail(String email) {
    return repo.findByEmail(email);
}
}
