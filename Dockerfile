FROM quay.io/quarkus/ubi-quarkus-mandrel-builder-image:23.1-java17 AS build
COPY --chown=quarkus:quarkus . /home/quarkus/project
WORKDIR /home/quarkus/project
RUN ./mvnw package -Dquarkus.package.type=fast-jar

FROM registry.access.redhat.com/ubi8/openjdk-17-runtime:1.20
ENV LANGUAGE='en_US:en'
COPY --from=build /home/quarkus/project/target/quarkus-app/ /deployments/
EXPOSE 8080
USER 185
ENTRYPOINT ["java", "-jar", "/deployments/quarkus-run.jar"]