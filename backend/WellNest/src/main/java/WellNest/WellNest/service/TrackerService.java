package WellNest.WellNest.service;

import WellNest.WellNest.model.Tracker;
import WellNest.WellNest.repository.TrackerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class TrackerService {

    @Autowired
    private TrackerRepository trackerRepository;

    // Fetch tracker for a user for a specific date
    public Optional<Tracker> getTrackerByEmailAndDate(String email, LocalDate date) {
        return trackerRepository.findByEmailAndDate(email, date);
    }

    // Return all trackers for an email
    public List<Tracker> getTrackersByEmail(String email) {
        return trackerRepository.findByEmail(email);
    }

    // Save or update tracker for given date
    public Tracker saveOrUpdateTracker(Tracker tracker) {
        Optional<Tracker> existingTracker = trackerRepository.findByEmailAndDate(tracker.getEmail(), tracker.getDate());

        if (existingTracker.isPresent()) {
            Tracker update = existingTracker.get();
            update.setWorkouts(tracker.getWorkouts());
            update.setMeals(tracker.getMeals());
            update.setWaterIntake(tracker.getWaterIntake());
            update.setSleepLog(tracker.getSleepLog());
            return trackerRepository.save(update);
        } else {
            return trackerRepository.save(tracker);
        }
    }
}