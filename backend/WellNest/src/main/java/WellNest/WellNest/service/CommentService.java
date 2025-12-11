package WellNest.WellNest.service;

import WellNest.WellNest.model.Comment;
import WellNest.WellNest.repository.CommentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository repo;

    public CommentService(CommentRepository repo) {
        this.repo = repo;
    }

    public Comment addComment(Comment comment) {
        comment.setCommentedAt(System.currentTimeMillis());
        return repo.save(comment);
    }

    public List<Comment> getCommentsBySource(String sourceId, String sourceType) {
        return repo.findBySourceIdAndSourceType(sourceId, sourceType);
    }
}
