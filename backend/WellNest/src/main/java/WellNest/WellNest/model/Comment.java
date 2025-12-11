package WellNest.WellNest.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "Comments")
public class Comment {
    @Id
    private String id;
    private String sourceId;
    private String sourceType;
    private String userId;
    private String userName;
    private String text;
    private long commentedAt;
    
}
