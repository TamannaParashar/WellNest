package WellNest.WellNest.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.util.List;

@Document(collection = "tracker")
public class Tracker {

    @Id
    private String id;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    private String email;

    private List<Workout> workouts;
    private List<Meal> meals;
    private List<WaterIntake> waterIntake;
    private List<SleepLog> sleepLog;

    public Tracker() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public List<Workout> getWorkouts() { return workouts; }
    public void setWorkouts(List<Workout> workouts) { this.workouts = workouts; }

    public List<Meal> getMeals() { return meals; }
    public void setMeals(List<Meal> meals) { this.meals = meals; }

    public List<WaterIntake> getWaterIntake() { return waterIntake; }
    public void setWaterIntake(List<WaterIntake> waterIntake) { this.waterIntake = waterIntake; }

    public List<SleepLog> getSleepLog() { return sleepLog; }
    public void setSleepLog(List<SleepLog> sleepLog) { this.sleepLog = sleepLog; }

    // ----------------- Nested Classes -----------------
    public static class Workout {
        private String exerciseType;
        private int duration; // in minutes
        private int calories;
        private int steps;

        // keep nested date as String to avoid strict parsing errors from locale-formatted strings
        private String date;
        private String splitDay; // Specific split segment completed (e.g., Push, Chest)

        public Workout() {}

        // Getters and Setters
        public String getExerciseType() { return exerciseType; }
        public void setExerciseType(String exerciseType) { this.exerciseType = exerciseType; }

        public int getDuration() { return duration; }
        public void setDuration(int duration) { this.duration = duration; }

        public int getCalories() { return calories; }
        public void setCalories(int calories) { this.calories = calories; }

        public int getSteps() { return steps; }
        public void setSteps(int steps) { this.steps = steps; } 

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }

        public String getSplitDay() { return splitDay; }
        public void setSplitDay(String splitDay) { this.splitDay = splitDay; }
    }

    public static class Meal {
        private String mealType;
        private int calories;
        private int protein;
        private int carbs;
        private int fats;

        // nested date as String
        private String date;

        public Meal() {}

        // Getters and Setters
        public String getMealType() { return mealType; }
        public void setMealType(String mealType) { this.mealType = mealType; }

        public int getCalories() { return calories; }
        public void setCalories(int calories) { this.calories = calories; }

        public int getProtein() { return protein; }
        public void setProtein(int protein) { this.protein = protein; }

        public int getCarbs() { return carbs; }
        public void setCarbs(int carbs) { this.carbs = carbs; }

        public int getFats() { return fats; }
        public void setFats(int fats) { this.fats = fats; }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
    }

    public static class WaterIntake {
        private double amount; // in liters
        private String notes;

        // nested date as String
        private String date;

        public WaterIntake() {}

        // Getters and Setters
        public double getAmount() { return amount; }
        public void setAmount(double amount) { this.amount = amount; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
    }

    public static class SleepLog {
        private double hours;
        private String quality;
        private String notes;

        // nested date as String
        private String date;

        public SleepLog() {}

        // Getters and Setters
        public double getHours() { return hours; }
        public void setHours(double hours) { this.hours = hours; }

        public String getQuality() { return quality; }
        public void setQuality(String quality) { this.quality = quality; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
    }
}