package WellNest.WellNest.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "user_profile")

public class UserProfile {

    @Id
    private String id;
    private String email;
    private String name;
    private int age;
    private double weight;
    private double height;
    private String gender;           // male / female / other
    private String dietType;         // vegetarian / non-vegetarian / vegan / eggetarian
    private String fitnessLevel;     // beginner / intermediate / advanced
    private String activityLevel;    // sedentary / lightly_active / moderately_active / very_active
    private String healthConditions; // comma-separated e.g. "diabetes, hypertension"
    private String allergies;        // comma-separated e.g. "nuts, dairy"
    private int goalSteps;
    private int goalCalories;
    private int goalExerciseMinutes;
    private double waterGoal;        // litres per day
    private double sleepGoal;        // hours per night
    private String sleepTime;        // HH:mm format for sleep alert
    private String gymSplit;         // Gym split (e.g. PPL, Bro Split)
}
