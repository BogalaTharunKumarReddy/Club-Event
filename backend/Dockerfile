# syntax=docker/dockerfile:1

##############################################
# Stage 1 — Build the Spring Boot fat JAR
##############################################
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /workspace

# Copy the POM first and warm the dependency cache. This layer is only
# rebuilt when pom.xml changes, so day-to-day source edits stay fast.
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn -B -q dependency:go-offline

# Now copy the sources and build. Tests are skipped for the image build
# (run them in CI with `mvn verify`); the jar name is fixed by <finalName>.
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -B -q clean package -DskipTests \
    && cp target/campusconnect-backend.jar /workspace/app.jar

##############################################
# Stage 2 — Minimal JRE runtime
##############################################
FROM eclipse-temurin:21-jre-jammy AS runtime
WORKDIR /app

# Run as an unprivileged user (never as root) for a smaller attack surface.
RUN groupadd --system spring && useradd --system --gid spring --home /app spring

# Copy only the built artifact from the build stage.
COPY --from=build /workspace/app.jar /app/app.jar
RUN chown -R spring:spring /app
USER spring

# The app listens on 8080 by default (override with SERVER_PORT).
EXPOSE 8080

# Container-level healthcheck hits the Spring Boot / springdoc endpoint.
# (No secrets are needed for this probe.)
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=5 \
    CMD wget -qO- "http://127.0.0.1:${SERVER_PORT:-8080}/v3/api-docs" > /dev/null 2>&1 || exit 1

# All configuration (DB URL, JWT secret, mail, payment provider, ...) is
# supplied through environment variables at runtime — nothing is baked in.
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
