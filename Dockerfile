# Tahap 1: Build
FROM eclipse-temurin:21-jdk AS build

WORKDIR /app

# Copy seluruh isi project ke folder /app
COPY . .

# Tambahkan baris ini untuk debugging (cek file ada di mana) dan eksekusi chmod
RUN ls -la && find . -name "mvnw" -exec chmod +x {} +

# Jalankan build. Jika mvnw ada di root, dia akan jalan. 
# Jika di subfolder, kita arahkan ke sana.
RUN ./mvnw package -DskipTests -Dquarkus.package.type=fast-jar

# Tahap 2: Runtime
FROM eclipse-temurin:21-jre
WORKDIR /deployments

# Ambil hasil build. 
# Quarkus fast-jar biasanya ada di target/quarkus-app/
COPY --from=build /app/target/quarkus-app/ .

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "quarkus-run.jar"]