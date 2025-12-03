package WellNest.WellNest.service;
import org.springframework.stereotype.Service;

import WellNest.WellNest.model.LoginEvent;
import WellNest.WellNest.repository.LoginRepository;

@Service
public class LoginService {
    private final LoginRepository repo;

    public LoginService(LoginRepository repo) {
        this.repo = repo;
    }

    public LoginEvent save(LoginEvent event) {
        return repo.save(event);
    }
}
