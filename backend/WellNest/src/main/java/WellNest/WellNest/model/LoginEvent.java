package WellNest.WellNest.model;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "login_events")
public class LoginEvent {
    @Id
    private String id;
    private String email;
    private String userType;
    private long timestamp;
}
