---
title: Example Feature Spec
status: draft
created: 2026-02-28
tags: [example]
diagrams:
  - id: arch-overview
    type: architecture
  - id: user-flow
    type: flow
---

# Example Feature Spec

## Overview

This is an example spec to demonstrate VisualSDD.

## Architecture

```mermaid
graph TD
    Client[Web Client] --> API[API Gateway]
    API --> AuthSvc[Auth Service]
    API --> UserSvc[User Service]
    AuthSvc --> DB[(PostgreSQL)]
    UserSvc --> DB
    AuthSvc --> Cache[(Redis)]
```

## User Flow

```mermaid
flowchart LR
    A[User visits site] --> B{Logged in?}
    B -->|Yes| C[Show dashboard]
    B -->|No| D[Show login]
    D --> E[Enter credentials]
    E --> F{Valid?}
    F -->|Yes| C
    F -->|No| G[Show error]
    G --> D
```

## Requirements

- Users can log in with email/password
- Sessions expire after 24 hours
- Failed logins are rate-limited

## Tasks

- [ ] Design database schema
- [ ] Implement auth endpoints
- [ ] Build login UI
