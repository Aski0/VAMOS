package pl.edu.pk.vamos.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;

@Table(name = "va_sources")
@Entity
@Data
@Getter
public class VaSource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "youtube_link", unique = true, nullable = false)
    private String youtubeLink;

    @Column(name = "title")
    private String title;

    @Column(name = "artist")
    private String artist;

    @Column(name = "is_video",nullable = false)
    private Boolean isVideo;
}
