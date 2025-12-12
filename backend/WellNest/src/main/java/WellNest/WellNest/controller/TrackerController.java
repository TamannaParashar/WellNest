package WellNest.WellNest.controller;

import WellNest.WellNest.model.Tracker;
import WellNest.WellNest.service.TrackerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tracker")
@CrossOrigin(origins = "*")
public class TrackerController {

    @Autowired
    private TrackerService trackerService;

    // Return all trackers for the provided email (frontend expects an array)
    @GetMapping("/email/{email}")
    public List<Tracker> getTrackersByEmail(@PathVariable String email) {
        return trackerService.getTrackersByEmail(email);
    }

    // Optional: endpoint to get today's tracker for an email (keeps previous behavior)
    @GetMapping("/email/{email}/today")
    public Tracker getTodayTracker(@PathVariable String email) {
        LocalDate today = LocalDate.now();
        Optional<Tracker> tracker = trackerService.getTrackerByEmailAndDate(email, today);
        return tracker.orElse(null);
    }

    @PostMapping
    public Tracker saveOrUpdateTracker(@RequestBody Tracker tracker) {
        if (tracker.getDate() == null) {
            tracker.setDate(LocalDate.now());
        }
        return trackerService.saveOrUpdateTracker(tracker);
    }
}