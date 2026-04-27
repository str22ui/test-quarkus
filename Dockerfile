# Tahap 1: Build
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Copy semua file dari root repository
COPY . .

# Pastikan kita ada di folder yang benar dan file mvnw ada
RUN ls -la && \
    sed -i 's/\r$//' ./mvnw && \
    chmod +x ./mvnw

# Jalankan build
RUN ./mvnw package -DskipTests -Dquarkus.package.type=fast-jar

# Tahap 2: Runtime
FROM eclipse-temurin:21-jre
WORKDIR /deployments
COPY --from=build /app/target/quarkus-app/ .
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "quarkus-run.jar"]