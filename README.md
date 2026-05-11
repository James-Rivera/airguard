# AirGuard: Smart Home Air Quality Monitoring and Risk Management System

AirGuard is a smart home prototype that monitors indoor air quality and manages related incidents and risks through a structured dashboard, incident workflow, risk register, audit logs, and compliance tracker.

## Academic Mapping

- ELEC: Smart Home Air Quality Monitoring
- IAS1: Security Incident and Risk Management System

## Core Features

- Air quality monitoring dashboard
- Simulated smart sensor events
- Automatic incident creation
- Device health monitoring
- Risk assessment and mitigation tracking
- Audit logs
- Compliance readiness checklist
- Management report generation

## MVP Limitations

- Uses simulated IoT data
- Uses localStorage instead of production database
- Uses mock login instead of real authentication
- Designed for prototype demonstration

## Future Improvements

- Connect to real ESP32 or Arduino sensors
- Add real authentication
- Add cloud database
- Add email/SMS alerts
- Add real-time device data
- Add PDF report export
- Add role-based permission enforcement

## Setup Instructions

```bash
npm install
npm run dev
```

Open the local URL shown by Next.js, then start at `/login`.

## Demo Flow

1. Login as Administrator
2. Open Dashboard
3. Simulate Smoke Detected
4. Show that a Critical incident is created
5. Open Incidents page
6. Investigate and resolve the incident
7. Open Risk Assessment and update mitigation status
8. Open Audit Logs to show traceability
9. Open Compliance page and show readiness score
10. Open Reports and print summary
