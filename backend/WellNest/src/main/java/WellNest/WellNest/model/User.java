package WellNest.WellNest.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "users")   // 🔥 changed
public class User {

    @Id
    private String id;
    private String email;
    private String userType;
    private long timestamp;
    private String name;
    private int age;
    private double weight;
    private double height;
    private String fitnessGoals;
}
