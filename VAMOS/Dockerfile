# Faza 1: Budowanie (używamy Maven)
FROM maven:3.9.5-eclipse-temurin-21 AS build
WORKDIR /app
# Kopiowanie pom.xml (dla szybkiego cache'owania zależności)
COPY pom.xml .
# Pobieranie zależności
RUN mvn dependency:go-offline
# Kopiowanie reszty źródeł
COPY src/ /app/src/
# Budowanie aplikacji
RUN mvn clean install -DskipTests

# Faza 2: Środowisko uruchomieniowe (lżejszy obraz JRE)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Kopiowanie zbudowanego JAR-a z fazy 1
COPY --from=build /app/target/*.jar app.jar
# Uruchomienie aplikacji
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]