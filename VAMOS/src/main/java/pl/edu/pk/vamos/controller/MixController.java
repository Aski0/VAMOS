package pl.edu.pk.vamos.controller;

import pl.edu.pk.vamos.model.VaSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.edu.pk.vamos.service.MixService;

import java.util.ArrayList;
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

    @GetMapping("/stress")
    public ResponseEntity<String> runStressTest() {
        long startTime = System.currentTimeMillis();
        long endTime = startTime + 5000; // ok. 5 sekund stresu

        List<int[]> memoryChunks = new ArrayList<>();
        long prime = 0;

        while (System.currentTimeMillis() < endTime) {

            // CPU: obliczenia
            long limit = 200_000; // możesz zwiększyć jak będzie za słabo
            for (long i = 1; i <= limit; i++) {
                if (isPrime(i)) {
                    prime = i;
                }
            }

            // RAM: trochę alokacji, ale nie przesadzajmy
            memoryChunks.add(new int[64 * 1024]); // ok. 256 KB na blok
            if (memoryChunks.size() > 50) {
                memoryChunks.clear(); // żeby nie dobijać do OOM
            }
        }

        long duration = System.currentTimeMillis() - startTime;
        return ResponseEntity.ok("Stress test zakończony. Ostatnia liczba pierwsza: "
                + prime + ", czas: " + duration + " ms, bloki: " + memoryChunks.size());
    }
    private boolean isPrime(long n) {
        if (n <= 1) return false;
        if (n == 2) return true;
        if (n % 2 == 0) return false;

        for (long i = 3; i * i <= n; i += 2) {
            if (n % i == 0) return false;
        }
        return true;
    }
}