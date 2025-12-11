package WellNest.WellNest.controller;

import WellNest.WellNest.model.Comment;
import WellNest.WellNest.model.Post;
import WellNest.WellNest.service.CommentService;
import WellNest.WellNest.service.PostService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*")
public class PostController {

    private final PostService service;
    private final CommentService commentService;

    public PostController(PostService service, CommentService commentService) {
        this.service = service;
        this.commentService = commentService;
    }

    @PostMapping
    public Post createPost(@RequestBody Map<String, String> body) {
        Post post = new Post();
        post.setUserId(body.get("userId"));
        post.setUserName(body.get("userName"));
        post.setContent(body.get("content"));
        return service.save(post);
    }

    @GetMapping
public List<Map<String, Object>> getAllPosts() {
    List<Post> posts = service.getAllPosts();

    return posts.stream().map(post -> {
        Map<String, Object> result = new HashMap<>();
        result.put("id", post.getId());
        result.put("userId", post.getUserId());
        result.put("userName", post.getUserName());
        result.put("content", post.getContent());
        result.put("likes", post.getLikes());
        result.put("likedBy", post.getLikedBy());
        result.put("createdAt", post.getCreatedAt());

        // ADD COMMENTS HERE
        List<Comment> comments =
                commentService.getCommentsBySource(post.getId(), "COMMUNITY");
        result.put("comments", comments);

        return result;
    }).toList();
}


    @PostMapping("/like")
    public Post likePost(@RequestBody Map<String, String> body) {
        return service.likePost(body.get("postId"), body.get("userId"));
    }

    @DeleteMapping("/like")
    public Post unlikePost(@RequestBody Map<String, String> body) {
        return service.unlikePost(body.get("postId"), body.get("userId"));
    }

    @PostMapping("/comment")
    public List<Comment> addComment(@RequestBody Map<String, String> body) {

        Comment comment = new Comment();
        comment.setSourceId(body.get("postId"));
        comment.setSourceType("COMMUNITY");
        comment.setUserId(body.get("userId"));
        comment.setUserName(body.get("userName"));
        comment.setText(body.get("text"));

        commentService.addComment(comment);

        return commentService.getCommentsBySource(body.get("postId"), "COMMUNITY");
    }

    @GetMapping("/{postId}/comments")
    public List<Comment> getComments(@PathVariable String postId) {
        return commentService.getCommentsBySource(postId, "COMMUNITY");
    }
}
