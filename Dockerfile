FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Sekarang karena .dockerignore sudah benar, semua file akan masuk
COPY . .

# Beri izin dan build
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw
RUN ./mvnw package -DskipTests -Dquarkus.package.type=fast-jar

FROM eclipse-temurin:21-jre
WORKDIR /deployments
COPY --from=build /app/target/quarkus-app/ .
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "quarkus-run.jar"]