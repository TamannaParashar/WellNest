package WellNest.WellNest.service;

import WellNest.WellNest.model.Blog;
import WellNest.WellNest.repository.BlogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BlogService {

    private final BlogRepository repo;

    public BlogService(BlogRepository repo) {
        this.repo = repo;
    }

    // Save blog (existing)
    public Blog save(Blog blog) {
        return repo.save(blog);
    }

    // Fetch all blogs
    public List<Blog> getAllBlogs() {
        return repo.findAll();
    }

    // Fetch blogs by userType (user/trainer)
    public List<Blog> getBlogsByUserType(String userType) {
        return repo.findAll().stream()
                .filter(blog -> blog.getUserType().equalsIgnoreCase(userType))
                .toList();
    }
    public Blog likeBlog(String blogId, String userId) {
    Blog blog = repo.findById(blogId).orElseThrow();
    blog.getLikedBy().add(userId); 
    blog.setLikes(blog.getLikedBy().size());
    return repo.save(blog);
}

public Blog unlikeBlog(String blogId, String userId) {
    Blog blog = repo.findById(blogId).orElseThrow();
    blog.getLikedBy().remove(userId);
    blog.setLikes(blog.getLikedBy().size());
    return repo.save(blog);
}


}
