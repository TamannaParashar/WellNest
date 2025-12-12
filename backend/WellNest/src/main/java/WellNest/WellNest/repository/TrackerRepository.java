package WellNest.WellNest.repository;

import WellNest.WellNest.model.Tracker;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrackerRepository extends MongoRepository<Tracker, String> {
    Optional<Tracker> findByEmailAndDate(String email, LocalDate date);
    List<Tracker> findByEmail(String email);
}