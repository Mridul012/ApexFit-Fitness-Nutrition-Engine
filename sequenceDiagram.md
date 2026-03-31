# ApexFit: Sequence Diagram

### 1. Overview
The ApexFit Sequence Diagram details the end-to-end flow of data when a user interacts with the system to log their fitness activities. It highlights the synchronous request cycle from the client application to the backend API, followed by an internal process where the Recommendation Service applies rule-based logic to generate actionable, personalized insights.

### 2. Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    
    actor User
    participant Frontend as Client App
    participant API as Backend API
    participant RecService as Recommendation Service
    participant DB as Database

    %% Phase 1 — User Data Logging
    Note over User, DB: Phase 1 — User Data Logging
    User->>Frontend: Logs Meal / Workout Data
    Frontend->>API: POST /api/v1/meals (or workouts)
    API->>DB: Insert new log record
    DB-->>API: Confirm save (Success)
    
    %% Phase 2 — Data Processing & Rule Evaluation
    Note over API, DB: Phase 2 — Data Processing & Rule Evaluation
    API->>RecService: generateRecommendations(userId)
    RecService->>DB: Fetch recent meals, workouts, and progress data
    DB-->>RecService: Return aggregated User Logs
    RecService->>RecService: Apply Rule-Based Logic (e.g., Calorie Variance)
    
    %% Phase 3 — Recommendation Generation
    Note over RecService, DB: Phase 3 — Recommendation Generation
    RecService->>DB: Store generated Recommendation record
    DB-->>RecService: Confirm save (rec_id)
    RecService-->>API: Return Recommendation status
    API-->>Frontend: 201 Created (Data Logged + Rec Triggered)
    
    %% Phase 4 — User Insight Delivery
    Note over User, Frontend: Phase 4 — User Insight Delivery
    Frontend->>API: GET /api/v1/recommendations/latest
    API->>DB: Fetch unread recommendations
    DB-->>API: Return RecommendationDTO
    API-->>Frontend: 200 OK (Insights payload)
    Frontend-->>User: Displays updated Dashboard Insights
```

### 3. Flow Summary Table

| Phase | Description | Key Patterns |
| :--- | :--- | :--- |
| **Phase 1 — User Data Logging** | The user inputs daily nutritional or physical activity data via the frontend interface, which the API strictly validates and saves. | Request-Response, CRUD Operations |
| **Phase 2 — Data Processing & Rule Evaluation** | The backend service retrieves historical data aggregates and applies rules to check user progress. | Data Aggregation, Rule-Based Processing |
| **Phase 3 — Recommendation Generation** | Tailored advice is generated based on the rules and saved in the database. | Internal Service Process, Persistence |
| **Phase 4 — User Insight Delivery** | The front end fetches the new recommendations and updates the dashboard for the user. | Client Retrieval, Data Presentation |
