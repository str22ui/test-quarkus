FROM eclipse-temurin:21-jdk AS build
COPY --chown=1000 . /home/node/project
WORKDIR /home/node/project

RUN chmod +x mvnw
RUN ./mvnw package -DskipTests -Dquarkus.package.type=fast-jar

FROM eclipse-temurin:21-jre
ENV LANGUAGE='en_US:en'
COPY --from=build /home/node/project/target/quarkus-app/ /deployments/
EXPOSE 8080
USER 1000
ENTRYPOINT ["java", "-jar", "/deployments/quarkus-run.jar"]