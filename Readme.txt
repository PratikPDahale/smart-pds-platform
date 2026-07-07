# E-Ration Public Distribution System

A full-stack Public Distribution System (PDS) platform for digitizing ration distribution workflows, managing fair price shop inventory, tracking citizen entitlements, handling dealer restock requests, resolving grievances, and generating demand forecasts for smarter stock planning.

The project combines a Spring Boot backend, React admin/user dashboards, service discovery infrastructure, and a Python ML forecasting service.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup and Installation](#setup-and-installation)
- [Running the Application](#running-the-application)
- [API Overview](#api-overview)
- [ML Forecasting Service](#ml-forecasting-service)
- [Testing](#testing)
- [Important Notes Before Publishing](#important-notes-before-publishing)
- [Documentation](#documentation)
- [Future Enhancements](#future-enhancements)
- [License](#license)

## Overview

The E-Ration PDS system is designed to improve transparency and operational efficiency in ration distribution. It supports role-based workflows for administrators, dealers, and citizens while maintaining core records for users, products, inventory, quotas, distributions, restock requests, grievances, and stock predictions.

The primary backend service is located in `mainapp`. The main frontend is located in `frontend1`. Supporting infrastructure includes Eureka Server, Spring Cloud Config Server, API Gateway, and an optional Python ML service under `e-ration-system/ml-service`.

## Features

- Admin, dealer, and citizen user workflows
- Admin registration and login foundation
- Citizen profile and ration card management
- Dealer registration, approval, activation, and region-based filtering
- Product catalog management
- Monthly quota management
- Dealer inventory tracking
- Low-stock alerts
- Ration distribution transaction history
- Restock request approval and rejection workflow
- Citizen grievance submission and status tracking
- Admin dashboards, reports, and analytics
- Demand forecasting with festival-aware prediction logic in Spring Boot
- Optional Python ML service for model-based demand prediction and visual reports
- Service discovery with Eureka
- Centralized configuration support with Spring Cloud Config
- React dashboard UI with protected routes by role

## Architecture

```text
Frontend (React + Vite)
        |
        | HTTP / JSON
        v
Spring Boot Main App (REST APIs, business logic, persistence)
        |
        | JPA / Hibernate
        v
PostgreSQL Database

Supporting services:
Eureka Server <-> Config Server <-> API Gateway

Optional forecasting service:
React / Forecast backend -> Flask ML API -> trained model + datasets
```

The core backend follows a layered architecture:

```text
Controller -> Service -> Repository -> Database
```

DTOs are used for request and response models, repositories use Spring Data JPA, and global exception handling provides consistent API responses.

## Tech Stack

### Backend

- Java 17
- Spring Boot 3.x
- Spring Data JPA
- Spring Security
- Spring Validation
- Spring Cloud Eureka
- Spring Cloud Config
- Spring Cloud Gateway
- PostgreSQL
- Maven
- Lombok

### Frontend

- React 18
- Vite
- React Router
- Axios
- Recharts
- Lucide React
- React Hot Toast

### Machine Learning Service

- Python
- Flask
- Pandas
- NumPy
- Scikit-learn
- Joblib
- Matplotlib / Seaborn

## Project Structure

```text
PDS/
|-- mainapp/                    # Primary Spring Boot backend
|   |-- src/main/java/com/mainapp
|   |   |-- controller/          # REST controllers
|   |   |-- service/             # Business logic
|   |   |-- repository/          # JPA repositories
|   |   |-- model/               # Entity classes
|   |   |-- dto/                 # Request/response DTOs
|   |   |-- exception/           # Global exception handling
|   |   `-- config/              # Application configuration
|   `-- pom.xml
|-- frontend1/                  # Main React + Vite frontend
|   |-- src/
|   |   |-- api/
|   |   |-- context/
|   |   `-- features/admin/
|   `-- package.json
|-- eurekaserver/               # Eureka service registry
|-- configserver/               # Spring Cloud Config Server
|-- gateway/                    # Spring Cloud API Gateway
|-- e-ration-system/
|   |-- ml-service/             # Flask ML forecasting service
|   |-- backend/                # Forecast proxy backend / legacy module
|   `-- frontend/               # Forecast UI / legacy React module
|-- documentation/              # Detailed project documentation
`-- README.md
```

## Prerequisites

Install the following before running the project:

- Java 17 or later
- Maven 3.8 or later, or use the included Maven wrappers
- Node.js 18 or later
- npm
- PostgreSQL
- Python 3.10 or later, for the ML service

## Setup and Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd PDS
```

### 2. Create the PostgreSQL Database

```sql
CREATE DATABASE erationdb;
```

### 3. Configure Backend Database Credentials

Update the database configuration in:

```text
mainapp/src/main/resources/application.properties
configserver/src/main/resources/config/mainapp.properties
```

Use your local PostgreSQL credentials:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/erationdb
spring.datasource.username=YOUR_POSTGRES_USERNAME
spring.datasource.password=YOUR_POSTGRES_PASSWORD
```

### 4. Install Frontend Dependencies

```bash
cd frontend1
npm install
```

Optional: create a `.env` file in `frontend1` if your API URL is different:

```env
VITE_API_BASE_URL=http://localhost:8081/api
```

## Running the Application

Open separate terminals for each service.

### 1. Start Eureka Server

```bash
cd eurekaserver
./mvnw spring-boot:run
```

Windows:

```powershell
cd eurekaserver
.\mvnw.cmd spring-boot:run
```

Eureka Dashboard:

```text
http://localhost:8761
```

### 2. Start Config Server

```bash
cd configserver
./mvnw spring-boot:run
```

Windows:

```powershell
cd configserver
.\mvnw.cmd spring-boot:run
```

Config Server:

```text
http://localhost:8888
```

### 3. Start API Gateway

```bash
cd gateway
./mvnw spring-boot:run
```

Windows:

```powershell
cd gateway
.\mvnw.cmd spring-boot:run
```

Gateway:

```text
http://localhost:8080
```

### 4. Start Main Backend

```bash
cd mainapp
./mvnw spring-boot:run
```

Windows:

```powershell
cd mainapp
.\mvnw.cmd spring-boot:run
```

Main API:

```text
http://localhost:8081/api
```

### 5. Start Frontend

```bash
cd frontend1
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## API Overview

Base URL:

```text
http://localhost:8081/api
```

Main endpoint groups:

| Module | Base Path | Description |
| --- | --- | --- |
| Authentication | `/api/auth` | Login and admin registration |
| Users | `/api/users` | Generic user management |
| Citizens | `/api/citizens` | Citizen profile and ration card operations |
| Dealers | `/api/dealers` | Dealer registration, approval, activation, and filtering |
| Products | `/api/products` | Product catalog CRUD |
| Inventory | `/api/inventory` | Stock updates, stock checks, and low-stock alerts |
| Quotas | `/api/quotas` | Monthly quota setup and citizen quota status |
| Distributions | `/api/distributions` | Ration distribution and transaction history |
| Predictions | `/api/predictions` | Demand forecast generation and lookup |
| Restock Requests | `/api/restock-requests` | Dealer restock request workflow |
| Grievances | `/api/grievances` | Citizen grievance workflow |
| Admin | `/api/admin` | Dashboard stats, reports, and analytics |

Example health check:

```bash
curl http://localhost:8081/api/products
```

Example admin registration:

```bash
curl -X POST http://localhost:8081/api/auth/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "email": "admin@example.com",
    "fullName": "System Admin",
    "phone": "9999999999",
    "department": "Food and Civil Supplies",
    "designation": "Administrator"
  }'
```

For detailed request and response examples, see:

- `documentation/API_ENDPOINTS_REFACTORED.md`
- `documentation/API_DOCUMENTATION.md`
- `documentation/TESTING_GUIDE.md`

## ML Forecasting Service

The optional ML service is located in:

```text
e-ration-system/ml-service
```

It exposes Flask endpoints for metadata, summary, historical demand, batch prediction, visual assets, and demand prediction.

### Run ML Service

```bash
cd e-ration-system/ml-service
python -m venv .venv
```

Activate the virtual environment:

```bash
source .venv/bin/activate
```

Windows:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install flask pandas numpy scikit-learn joblib matplotlib seaborn
```

Start the service:

```bash
python app.py
```

ML API:

```text
http://localhost:5000
```

Available endpoints include:

- `GET /metadata`
- `GET /summary`
- `GET /history`
- `POST /predict`
- `POST /predict-batch`
- `GET /visuals`

## Testing

Run backend tests:

```bash
cd mainapp
./mvnw test
```

Windows:

```powershell
cd mainapp
.\mvnw.cmd test
```

Run frontend build check:

```bash
cd frontend1
npm run build
```

Run frontend lint:

```bash
cd frontend1
npm run lint
```

## Important Notes Before Publishing

- Remove real database passwords from committed configuration files before pushing to GitHub.
- Prefer environment variables or profile-specific local config for secrets.
- Review generated model files and datasets before publishing if they contain sensitive or licensed data.
- Security currently permits all backend routes for development; tighten authentication and authorization before production deployment.
- The primary application path is `mainapp` + `frontend1`. The `e-ration-system/backend` and `e-ration-system/frontend` modules appear to support the ML forecasting workflow or earlier development work.

## Documentation

Additional documentation is available in the `documentation` directory:

- `documentation/PROJECT_SUMMARY.md`
- `documentation/QUICK_START_GUIDE.md`
- `documentation/API_ENDPOINTS_REFACTORED.md`
- `documentation/API_DOCUMENTATION.md`
- `documentation/TESTING_GUIDE.md`
- `documentation/ARCHITECTURE_FLOW.md`
- `documentation/SYSTEM_FLOW_DIAGRAM.md`
- `documentation/QUOTA_MANAGEMENT_GUIDE.md`
- `documentation/ADMIN_REGISTRATION_GUIDE.md`

## Future Enhancements

- JWT-based authentication and refresh tokens
- Role-level endpoint authorization for Admin, Dealer, and Citizen users
- Production-ready API Gateway routing rules
- Docker Compose setup for backend, database, frontend, and ML service
- CI/CD pipeline with automated tests and build checks
- Notification system for low-stock alerts and grievance updates
- PDF or Excel report generation
- Cloud deployment with managed database and secure secret storage

## License

This project is developed for academic and demonstration purposes. Add a license file before publishing if the repository will be shared publicly.
