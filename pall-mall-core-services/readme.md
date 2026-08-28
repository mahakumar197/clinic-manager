# pallmall Backend System

## Overview

Microservices-based pallmall management system built with NestJS, Turborepo, and PostgreSQL.

## Architecture

The system consists of the following microservices:

- **Operations Service**: Authentication, Authorization, and User Management. (Default Port 3001)
- **Patient Service**: Patient records and management. (Default Port 3002)
- **Content Service**: Content and journey management. (Default Port 3003)
- **Notification Service**: Email, SMS, and Push notifications. (Default Port 3004)
- **Integration Service**: Integration with external systems (Zoho, etc.). (Default Port 3005)

### Port Configuration

All service ports are configurable via environment variables:

- `PORT_OPERATIONS` - Operations service (default: 3001)
- `PORT_CONTENT` - Content service (default: 3003)
- `PORT_NOTIFICATION` - Notification service (default: 3004)
- `PORT_PATIENT` - Patient service (default: 3002)
- `PORT_INTEGRATION` - Integration service (default: 3005)

## Infrastructure

- **PostgreSQL**: Database per service.
- **Kafka**: Message broker for async communication.
- **Docker Compose**: Orchestration for local development.

## Prerequisites

- Node.js >= 18
- pnpm
- Docker & Docker Compose

## Setup

1. **Install Dependencies**

   ```bash
   pnpm install
   ```

2. **Start Infrastructure**

   ```bash
   docker-compose up -d
   ```

3. **Start Microservices**
   ```bash
   pnpm dev
   ```
   This command runs `turbo run dev`, starting all applications in parallel.

## API Documentation

Swagger UI is available for each service at `/api` (ports are configurable):

- Operations: http://localhost:{PORT_OPERATIONS}/api (default: 3001)
- Patient: http://localhost:{PORT_PATIENT}/api (default: 3002)
- Content: http://localhost:{PORT_CONTENT}/api (default: 3003)
- Notification: http://localhost:{PORT_NOTIFICATION}/api (default: 3004)
- Integration: http://localhost:{PORT_INTEGRATION}/api (default: 3005)

## Health Checks

Health check endpoints are available at `/healthcheck` for each service.
