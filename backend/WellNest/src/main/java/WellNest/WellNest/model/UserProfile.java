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
    private String fitnessGoals;
}
