package pl.edu.pk.vamos.repository;

import pl.edu.pk.vamos.model.VaSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VaSourceRepository extends JpaRepository<VaSource, Long> {
    List<VaSource> findByIsVideoTrue();

    List<VaSource> findByIsVideo(Boolean isVideo);
}