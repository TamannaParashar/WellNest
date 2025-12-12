package WellNest.WellNest.model;

import lombok.Data;

import java.util.HashSet;
import java.util.Set;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "Blogs")
public class Blog {
    @Id
    private String id;

    private String authorId;   
    private String authorName;
    private String title;
    private String content;
    private String userType;
    private String thumbnailUrl;

    private long createdAt;
    private long updatedAt;

    private int likes = 0;
    private Set<String> likedBy = new HashSet<>();
    
}
