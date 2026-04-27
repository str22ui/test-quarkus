# Tahap 1: Build
FROM eclipse-temurin:21-jdk AS build

# Set working directory langsung di root agar tidak bentrok dengan user 'node'
WORKDIR /app

# Copy semua file project
COPY . .

# Pastikan file mvnw bisa dieksekusi dengan akses root
USER root
RUN chmod +x mvnw

# Jalankan build
RUN ./mvnw package -DskipTests -Dquarkus.package.type=fast-jar

# Tahap 2: Runtime
FROM eclipse-temurin:21-jre
WORKDIR /deployments

# Copy hasil build dari tahap sebelumnya
COPY --from=build /app/target/quarkus-app/ .

EXPOSE 8080

# Jalankan aplikasi
ENTRYPOINT ["java", "-jar", "quarkus-run.jar"]