# Industrial Edge Data Acquisition & Monitoring Platform

## Overview

This project is a distributed IIoT / Industry 4.0 simulation platform designed
to demonstrate OT/IT integration.

Architecture:

PLC (CODESYS SoftPLC) → OPC UA → Node Edge Service → MQTT → Node Backend →
PostgreSQL → React Dashboard

## Project Goals

- Simulate industrial machine data using PLC logic
- Expose machine data through OPC UA
- Collect data via Node.js Edge Service
- Publish telemetry through MQTT
- Persist data into PostgreSQL
- Provide REST API and real-time dashboard
- Demonstrate distributed deployment across OT and IT nodes
- Implement basic fault tolerance and reconnect logic

## Deployment Topology

### Machine A (OT Node)

- CODESYS SoftPLC
- OPC UA Server
- Node Edge Service
- Mosquitto MQTT Broker

### Machine B (IT Node)

- Node Backend Service
- PostgreSQL
- WebSocket
- React Dashboard

## Main Features

- Industrial-style PLC machine simulation
- Structured machine data model
- OPC UA integration
- MQTT event-driven architecture
- Distributed OT/IT deployment
- PostgreSQL persistence
- REST API
- Real-time dashboard
- Alarm handling
- KPI calculation
- Reconnect and recovery mechanisms

## Repository Structure

```text
.
├─ docs/             # architecture, screenshots, testing notes
├─ plc/              # CODESYS/ST code and PLC documentation
├─ edge-service/     # OPC UA client + MQTT publisher
├─ backend-service/  # MQTT subscriber + DB + REST + WebSocket
├─ frontend/         # React dashboard
├─ database/         # SQL schema and initialization scripts
└─ deploy/           # docker-compose and deployment notes
```

## Tech Stack

- CODESYS
- Structured Text (ST)
- OPC UA
- Node.js
- MQTT / Mosquitto
- PostgreSQL
- React
- Docker

## Current Status

- - [x] 1: PLC + OPC UA + Edge
- - [ ] 2: MQTT distributed architecture
- - [ ] 3: Database + REST + Docker
- - [ ] 4: Real-time dashboard + KPI + stability test

## Planned Documentation

- System architecture diagram
- MQTT topic specification
- OPC UA node mapping
- Database schema
- API endpoints
- Fault injection tests
- Stability test report

## Future Improvements

- Authentication and role-based access
- Historical trend analytics
- More advanced alarm model
- Edge buffering during broker downtime
- CI pipeline for backend/frontend
