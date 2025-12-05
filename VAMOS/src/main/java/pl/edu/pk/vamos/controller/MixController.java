package pl.edu.pk.vamos.controller;

import pl.edu.pk.vamos.model.VaSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.edu.pk.vamos.service.MixService;

import java.util.List;

@RestController
@RequestMapping("/api/mix")
@CrossOrigin(origins = "*")
public class MixController {
    private final MixService mixService;

    public MixController(MixService mixService) {
        this.mixService = mixService;
    }

    @GetMapping("/sources")
    public ResponseEntity<List<VaSource>> getSources() {
        List<VaSource> sources = mixService.getAllSources();
        return ResponseEntity.ok(sources);
    }

    @GetMapping("/random")
    public ResponseEntity<MixService.MixResult> getRandomMix() {
        try {
            MixService.MixResult result = mixService.getRandomMix();
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/custom")
    public ResponseEntity<MixService.MixResult> getCustomMix(@RequestBody MixService.MixResult customMix) {
        if (customMix == null || customMix.audioId() == null || customMix.videoId() == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(customMix);
    }
}