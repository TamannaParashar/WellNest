package WellNest.WellNest.service;

import WellNest.WellNest.model.Post;
import WellNest.WellNest.repository.PostRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostService {

    private final PostRepository repo;

    public PostService(PostRepository repo) {
        this.repo = repo;
    }

    public Post save(Post post) {
        post.setCreatedAt(System.currentTimeMillis());
        return repo.save(post);
    }

    public List<Post> getAllPosts() {
        return repo.findAll();
    }

    public Post likePost(String postId, String userId) {
        Post post = repo.findById(postId).orElseThrow();
        post.getLikedBy().add(userId);
        post.setLikes(post.getLikedBy().size());
        return repo.save(post);
    }

    public Post unlikePost(String postId, String userId) {
        Post post = repo.findById(postId).orElseThrow();
        post.getLikedBy().remove(userId);
        post.setLikes(post.getLikedBy().size());
        return repo.save(post);
    }
    public void deleteById(String postId){
        repo.deleteById(postId);
    }
}
