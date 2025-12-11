package WellNest.WellNest.controller;

import WellNest.WellNest.model.Blog;
import WellNest.WellNest.model.Comment;
import WellNest.WellNest.service.BlogService;
import WellNest.WellNest.service.CommentService;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/blogs")
@CrossOrigin(origins = "*")
public class BlogController {

    private final BlogService service;
    private final CommentService commentService;

    public BlogController(BlogService service, CommentService commentService) {
        this.service = service;
        this.commentService = commentService;
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public Blog createBlog(
            @RequestParam("authorId") String authorId,
            @RequestParam("authorName") String authorName,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("userType") String userType,
            @RequestParam("thumbnail") MultipartFile thumbnail
    ) throws IOException {

        java.nio.file.Path uploadDir = java.nio.file.Paths.get("uploads");
        if (!java.nio.file.Files.exists(uploadDir)) {
            java.nio.file.Files.createDirectories(uploadDir);
        }

        String fileName = System.currentTimeMillis() + "_" + thumbnail.getOriginalFilename();
        String path = "uploads/" + fileName;
        java.nio.file.Files.copy(thumbnail.getInputStream(), java.nio.file.Paths.get(path));

        Blog blog = new Blog();
        blog.setAuthorId(authorId);
        blog.setAuthorName(authorName);
        blog.setTitle(title);
        blog.setContent(content);
        blog.setUserType(userType);
        blog.setThumbnailUrl(path);
        blog.setCreatedAt(System.currentTimeMillis());
        blog.setUpdatedAt(System.currentTimeMillis());

        return service.save(blog);
    }

    @GetMapping
    public List<Blog> getAllBlogs() {
        return service.getAllBlogs();
    }

    @GetMapping("/filter")
    public List<Blog> getBlogsByUserType(@RequestParam String userType) {
        return service.getBlogsByUserType(userType);
    }

    @PostMapping("/like")
    public Blog likeBlog(@RequestBody Map<String, String> body) {
        return service.likeBlog(body.get("blogId"), body.get("userId"));
    }

    @DeleteMapping("/like")
    public Blog unlikeBlog(@RequestBody Map<String, String> body) {
        return service.unlikeBlog(body.get("blogId"), body.get("userId"));
    }

    // FIXED COMMENT ENDPOINT
    @PostMapping("/comment")
    public List<Comment> addComment(@RequestBody Map<String, String> body) {

        Comment comment = new Comment();
        comment.setSourceId(body.get("blogId"));
        comment.setSourceType("BLOG");
        comment.setUserId(body.get("userId"));
        comment.setUserName(body.get("userName"));
        comment.setText(body.get("text"));

        commentService.addComment(comment);

        return commentService.getCommentsBySource(body.get("blogId"), "BLOG");
    }

    @GetMapping("/{blogId}/comments")
    public List<Comment> getComments(@PathVariable String blogId) {
        return commentService.getCommentsBySource(blogId, "BLOG");
    }
}
