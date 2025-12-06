
VAMOS
Aplikacja webowa typu Video Audio Mashup, stworzona w architekturze wielokontenerowej. Używa backendu Spring Boot, bazy danych PostgreSQL, frontendu React oraz kompletnego środowiska monitorowania Zabbix.
Projekt spełnia wymagania dotyczące aplikacji złożonej z minimum 4 komponentów z obowiązkowym wykorzystaniem monitoringu Zabbix.

Przed uruchomieniem aplikacji upewnij się, że masz zainstalowane:
Docker Desktop.
Docker Compose.


VAMOS/
├── VAMOS/              <-- Backend (Spring Boot)
├── VAMOS_frontend/     <-- Frontend (React/Vite)
├── init-db/            <-- Skrypty SQL do inicjalizacji danych
└── compose.yml         <-- Definicja architektury


docker compose up --build -d


--build: Wymusza zbudowanie obrazów app i frontend na podstawie lokalnych plików Dockerfile.


Aplikacja VAMOS

Adres: Otwórz http://localhost:3000
Test: Spróbuj kliknąć przycisk RANDOM MIX. Aplikacja powinna pobrać wylosowane ID z bazy i rozpocząć odtwarzanie miksu.

Konfiguracja Monitorowania Zabbix
Dostęp: Przejdź do http://localhost:8081
Logowanie: Użyj domyślnych poświadczeń: Admin / zabbix


4.3. Test Obciążenia (Demonstracja Monitoringu)
Aby wygenerować obciążenie CPU w kontenerze Spring Boot i zobaczyć je na wykresach Zabbixa:
Uruchom Obciążenie: Otwórz nową kartę przeglądarki i wywołaj endpoint START:
http://localhost:8080/api/mix/stress

SKRYPT DO TESTOWANIA ENDPOINTA http://localhost:8080/api/mix/stress
while ($true) {    
     try {
         Invoke-RestMethod "http://localhost:8080/api/mix/stress" -TimeoutSec 60 | Out-Null
         Write-Host "OK - stress executed"
     }
     catch {
         Write-Host "ERROR: $($_.Exception.Message)"
     }

     Start-Sleep -Milliseconds 200
}
