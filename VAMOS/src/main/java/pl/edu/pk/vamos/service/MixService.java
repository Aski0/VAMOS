package pl.edu.pk.vamos.service;

import pl.edu.pk.vamos.model.VaSource;
import org.springframework.stereotype.Service;
import pl.edu.pk.vamos.repository.VaSourceRepository;

import java.util.List;
import java.util.Random;

@Service
public class MixService {
    private final VaSourceRepository vaSourceRepository;
    private final Random random = new Random();

    public MixService(VaSourceRepository vaSourceRepository) {
        this.vaSourceRepository = vaSourceRepository;
    }

    public record MixResult(String audioId, String videoId) {}

    public MixResult getRandomMix() {

        // AUDIO: Pobieramy wszystkie źródła
        List<VaSource> allSources = vaSourceRepository.findAll();

        // VIDEO: Pobieramy tylko te, które mają klip (isVideo = TRUE)
        List<VaSource> videoSources = vaSourceRepository.findByIsVideoTrue();

        if(allSources.isEmpty() || videoSources.isEmpty()) {
            throw new IllegalArgumentException("No mix found");
        }

        // Losowanie
        VaSource randomMusic = allSources.get(random.nextInt(allSources.size()));
        VaSource randomVideo = videoSources.get(random.nextInt(videoSources.size()));

        // Zwracamy ID YouTube
        return new MixResult(randomMusic.getYoutubeLink(), randomVideo.getYoutubeLink());
    }

    public List <VaSource> getAllSources() {
        return vaSourceRepository.findAll();
    }
}