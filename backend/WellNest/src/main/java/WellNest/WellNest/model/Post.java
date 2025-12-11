package WellNest.WellNest.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashSet;
import java.util.Set;

@Data
@Document(collection = "CommunityPosts")
public class Post {
    @Id
    private String id;

    private String userId;
    private String userName;
    private String content;

    private long createdAt;

    private int likes = 0;
    private Set<String> likedBy = new HashSet<>();
}
