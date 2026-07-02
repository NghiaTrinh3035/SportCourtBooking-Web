# ============================================================
# Stage 1: BUILD
# Use official Maven image with Java 17 to compile the project
# ============================================================
FROM maven:3.9.9-eclipse-temurin-17-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the Maven wrapper and pom.xml first for dependency caching
# This layer is cached as long as pom.xml does not change
COPY pom.xml .
COPY .mvn/ .mvn/
COPY mvnw .

# Download all dependencies (cached layer)
RUN ./mvnw dependency:go-offline -B

# Copy the rest of the source code
COPY src ./src

# Build the project, skip tests to speed up CI/CD pipeline
RUN ./mvnw clean package -DskipTests -B

# ============================================================
# Stage 2: RUN
# Use a lightweight JRE-only Alpine image for a minimal footprint
# ============================================================
FROM eclipse-temurin:17-jre-alpine AS runtime

# Add a non-root user for security best practices
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set the working directory
WORKDIR /app

# Copy only the compiled fat JAR from the build stage
COPY --from=build /app/target/backend_SportCourtBooking-0.0.1-SNAPSHOT.jar app.jar

# Change ownership to the non-root user
RUN chown appuser:appgroup app.jar

# Switch to the non-root user
USER appuser

# Expose the application port
EXPOSE 8080

# Health check to verify the application is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

# Set JVM options for container-aware memory management
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
