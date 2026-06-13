# MamaSafe Database Data Flow Diagrams

This document contains visual diagrams of the database architecture and data flows for the MamaSafe application.

## 1. System Architecture Overview

```mermaid
graph TB
    subgraph "Frontend Layer"
        HTML["HTML Pages<br/>index.html<br/>courses.html<br/>fertility-tracker.html<br/>pregnancy-test-calculator.html<br/>toddler-*.html"]
        JS["JavaScript Files<br/>script.js<br/>courses.js<br/>toddler-functions.js"]
        CSS["CSS Styling<br/>styles.css"]
    end

    subgraph "Service Layer"
        MongoSvc["MongoDB Service<br/>mongodb-service.js"]
        APIService["API Service<br/>api-service.js"]
        BackendAPI["Backend API<br/>backend-api.js"]
    end

    subgraph "Backend Infrastructure"
        Server["Express Server<br/>server.js"]
        Config["Configuration<br/>config.js<br/>setup-connection.js"]
    end

    subgraph "Database Layer"
        MongoDB["MongoDB Atlas<br/>Cluster: cluster0"]
        LocalStorage["Browser LocalStorage<br/>Fallback Cache"]
    end

    subgraph "Collections"
        Users["users"]
        PregnancyData["pregnancy_data"]
        BabyData["baby_data"]
        ToddlerData["toddler_data"]
        Milestones["milestones"]
        Appointments["appointments"]
        Nutrition["nutrition"]
        Sleep["sleep"]
        Activities["activities"]
        Progress["progress"]
    end

    HTML --> JS
    JS --> CSS
    JS --> MongoSvc
    JS --> APIService
    APIService --> BackendAPI
    MongoSvc --> Server
    BackendAPI --> Server
    Config --> Server
    Server --> MongoDB
    MongoSvc --> LocalStorage
    
    MongoDB --> Users
    MongoDB --> PregnancyData
    MongoDB --> BabyData
    MongoDB --> ToddlerData
    MongoDB --> Milestones
    MongoDB --> Appointments
    MongoDB --> Nutrition
    MongoDB --> Sleep
    MongoDB --> Activities
    MongoDB --> Progress

    style HTML fill:#e1f5ff
    style JS fill:#e1f5ff
    style CSS fill:#e1f5ff
    style MongoSvc fill:#fff3e0
    style APIService fill:#fff3e0
    style BackendAPI fill:#fff3e0
    style Server fill:#f3e5f5
    style MongoDB fill:#c8e6c9
    style LocalStorage fill:#ffccbc
```

## 2. User Data Flow

```mermaid
sequenceDiagram
    participant User as User Action
    participant Frontend as Frontend<br/>JavaScript
    participant Service as MongoDB Service
    participant Server as Express Server
    participant DB as MongoDB Atlas
    participant Cache as LocalStorage

    User->>Frontend: Trigger Event (Click, Submit)
    Frontend->>Service: saveUser(userData)
    Service->>Service: Generate ID & Timestamp
    Service->>DB: Insert/Update Document
    Service->>Cache: Store in LocalStorage
    DB-->>Service: Confirm Save
    Cache-->>Service: Cache Updated
    Service-->>Frontend: Return Saved Data
    Frontend-->>User: Display Confirmation
```

## 3. Pregnancy Tracking Data Flow

```mermaid
sequenceDiagram
    participant Page as Pregnancy Pages<br/>fertility-tracker.html
    participant Handler as JavaScript Handler<br/>script.js
    participant Service as MongoDBService
    participant DB as MongoDB<br/>pregnancy_data
    
    Page->>Handler: User Submits Form
    Handler->>Handler: Calculate Due Date<br/>Parse Input
    Handler->>Service: savePregnancyData(data)
    Service->>Service: Attach userId<br/>Add Timestamp
    Service->>DB: Save to Collection
    DB-->>Service: Success
    Service-->>Handler: Return Data
    Handler-->>Page: Update UI Display
```

## 4. Toddler Data Management Flow

```mermaid
graph LR
    A["Toddler Pages<br/>toddler-bathing.html<br/>toddler-feeding.html<br/>toddler-sleep-guides.html<br/>toddler-potty-training.html<br/>toddler-behavior.html<br/>toddler-playtime.html<br/>toddler-development.html"]
    
    B["Toddler Functions<br/>toddler-functions.js"]
    
    C["MongoDBService<br/>saveToddlerData"]
    
    D["MongoDB Collections"]
    D1["toddler_data"]
    D2["milestones"]
    D3["sleep"]
    D4["nutrition"]
    D5["activities"]
    
    A --> B
    B --> C
    C --> D
    D --> D1
    D --> D2
    D --> D3
    D --> D4
    D --> D5
    
    style A fill:#e1f5ff
    style B fill:#fff3e0
    style C fill:#fff3e0
    style D fill:#c8e6c9
    style D1 fill:#a5d6a7
    style D2 fill:#a5d6a7
    style D3 fill:#a5d6a7
    style D4 fill:#a5d6a7
    style D5 fill:#a5d6a7
```

## 5. Database Collection Relationships

```mermaid
graph TB
    Users["<b>users</b><br/>---<br/>id<br/>email<br/>name<br/>pregnancyStatus<br/>childrenAges"]
    
    PregnancyData["<b>pregnancy_data</b><br/>---<br/>userId (FK)<br/>lastPeriodDate<br/>estDueDate<br/>week<br/>symptoms<br/>testResults"]
    
    BabyData["<b>baby_data</b><br/>---<br/>userId (FK)<br/>childName<br/>dateOfBirth<br/>weight<br/>height<br/>vaccinations"]
    
    ToddlerData["<b>toddler_data</b><br/>---<br/>userId (FK)<br/>childId (FK)<br/>activities<br/>behaviors<br/>measurements"]
    
    Milestones["<b>milestones</b><br/>---<br/>userId (FK)<br/>childId (FK)<br/>milestone<br/>ageInMonths<br/>achieved<br/>dateAchieved"]
    
    Appointments["<b>appointments</b><br/>---<br/>userId (FK)<br/>type<br/>date<br/>provider<br/>location"]
    
    HealthMetrics["<b>Health Metrics</b><br/>---<br/>nutrition<br/>sleep<br/>activities"]
    
    Nutrition["<b>nutrition</b><br/>---<br/>userId (FK)<br/>childId (FK)<br/>date<br/>meals<br/>calories"]
    
    Sleep["<b>sleep</b><br/>---<br/>userId (FK)<br/>childId (FK)<br/>date<br/>duration<br/>quality"]
    
    Activities["<b>activities</b><br/>---<br/>userId (FK)<br/>childId (FK)<br/>type<br/>duration<br/>notes"]
    
    Users --> PregnancyData
    Users --> BabyData
    Users --> Appointments
    BabyData --> ToddlerData
    BabyData --> Milestones
    Users --> HealthMetrics
    HealthMetrics --> Nutrition
    HealthMetrics --> Sleep
    HealthMetrics --> Activities
    ToddlerData --> Nutrition
    ToddlerData --> Sleep
    ToddlerData --> Activities
    
    style Users fill:#c8e6c9
    style PregnancyData fill:#a5d6a7
    style BabyData fill:#a5d6a7
    style ToddlerData fill:#a5d6a7
    style Milestones fill:#a5d6a7
    style Appointments fill:#a5d6a7
    style HealthMetrics fill:#ffcc80
    style Nutrition fill:#a5d6a7
    style Sleep fill:#a5d6a7
    style Activities fill:#a5d6a7
```

## 6. CRUD Operations Flow

```mermaid
graph TB
    Request["User Request"]
    
    subgraph CRUD["CRUD Operations"]
        Create["CREATE<br/>mongoDBService.save<br/>collection, data<br/>↓<br/>Generate ID & Timestamp<br/>↓<br/>Insert to MongoDB<br/>↓<br/>Cache in LocalStorage"]
        
        Read["READ<br/>mongoDBService.get<br/>collection, query<br/>↓<br/>Query MongoDB<br/>↓<br/>Return Results<br/>↓<br/>Update LocalStorage"]
        
        Update["UPDATE<br/>mongoDBService.update<br/>collection, id, data<br/>↓<br/>Fetch Existing Doc<br/>↓<br/>Merge Updates<br/>↓<br/>Update Timestamp<br/>↓<br/>Save to MongoDB"]
        
        Delete["DELETE<br/>mongoDBService.delete<br/>collection, id<br/>↓<br/>Remove from MongoDB<br/>↓<br/>Remove from Cache"]
    end
    
    Response["Response to User"]
    
    Request --> CRUD
    CRUD --> Response
    
    style Create fill:#ffccbc
    style Read fill:#b3e5fc
    style Update fill:#fff9c4
    style Delete fill:#ffccbc
```

## 7. Data Storage Layer - Dual Architecture

```mermaid
graph TB
    Frontend["Frontend Application"]
    
    subgraph Primary["Primary Storage"]
        MongoDB["MongoDB Atlas<br/>Cloud Database<br/>---<br/>Persistent<br/>Scalable<br/>Real-time Sync<br/>Secure"]
    end
    
    subgraph Secondary["Secondary Storage"]
        LocalStorage["Browser LocalStorage<br/>Client-side Cache<br/>---<br/>Offline Access<br/>Fast Load<br/>5-10MB Limit"]
    end
    
    Service["MongoDBService<br/>Manages Both"]
    
    Frontend --> Service
    Service --> Primary
    Service --> Secondary
    
    Fallback["Fallback Logic<br/>If MongoDB ✗<br/>Use LocalStorage ✓"]
    
    Primary -.->|Sync| Secondary
    Secondary -.->|Fallback| Fallback
    
    style MongoDB fill:#c8e6c9
    style LocalStorage fill:#ffccbc
    style Service fill:#fff3e0
    style Fallback fill:#ffeb3b
```

## 8. Complete Request-Response Cycle

```mermaid
sequenceDiagram
    actor U as User
    participant B as Browser
    participant JS as JavaScript<br/>Handler
    participant MS as MongoDBService
    participant LS as LocalStorage
    participant ES as Express<br/>Server
    participant MA as MongoDB<br/>Atlas

    U->>B: Interact with Page
    B->>JS: Trigger Event
    JS->>MS: Call Method<br/>save/get/update/delete
    
    par MongoDB Operation
        MS->>ES: Send Request
        ES->>MA: Query/Modify Data
        MA-->>ES: Confirm Operation
        ES-->>MS: Return Response
    and LocalStorage Sync
        MS->>LS: Cache Update
        LS-->>MS: Cache Updated
    end
    
    MS-->>JS: Return Data
    JS->>B: Update DOM
    B-->>U: Display Result
```

## 9. MongoDB Collections Overview

| Collection | Purpose | Key Fields | Relations |
|---|---|---|---|
| **users** | User profiles and preferences | id, email, name, pregnancyStatus | Parent for all user data |
| **pregnancy_data** | Pregnancy tracking info | userId, lastPeriodDate, estDueDate, week | References users |
| **baby_data** | Baby/infant information | userId, childName, dateOfBirth, vaccinations | References users, parent for toddler data |
| **toddler_data** | Toddler activities & milestones | userId, childId, activities, behaviors | References users & baby_data |
| **milestones** | Child development milestones | userId, childId, milestone, achieved | References users & baby_data |
| **appointments** | Medical appointments | userId, type, date, provider, location | References users |
| **nutrition** | Feeding & nutrition logs | userId, childId, date, meals, calories | References users & baby_data |
| **sleep** | Sleep tracking data | userId, childId, date, duration, quality | References users & baby_data |
| **activities** | Activity & play logs | userId, childId, type, duration | References users & baby_data |
| **progress** | Overall progress tracking | userId, metrics, updates | References users |

## 10. Error Handling & Fallback Flow

```mermaid
graph TD
    A["User Action"]
    B["Try Connect MongoDB"]
    C{"Connection<br/>Success?"}
    D["Execute CRUD on MongoDB"]
    E["Cache in LocalStorage"]
    F{"MongoDB<br/>Fails?"}
    G["Use LocalStorage<br/>Fallback"]
    H["Return Data<br/>from Cache"]
    I["User Sees Data"]
    J["Show Offline Mode<br/>Warning"]
    
    A --> B
    B --> C
    C -->|Yes| D
    D --> E
    E --> F
    F -->|No| G
    C -->|No| G
    G --> H
    H --> J
    J --> I
    F -->|Yes| I
    
    style A fill:#e1f5ff
    style D fill:#c8e6c9
    style E fill:#a5d6a7
    style G fill:#ffccbc
    style H fill:#ffccbc
    style J fill:#fff9c4
    style I fill:#e1f5ff
```

---

## Configuration Details

### MongoDB Atlas Connection
- **Host**: `cluster0.ofrzq1d.mongodb.net`
- **Database**: `mamacare`
- **Username**: `ug2424887_db_user`
- **Connection Options**:
  - Retry writes: enabled
  - Write concern: majority
  - Pool size: 10
  - Selection timeout: 5000ms

### API Endpoints
- Base URL: `http://localhost:3000`
- Health Check: `/api/health`
- User endpoints: `/api/users/*`
- Data endpoints: `/api/[collection]/*`

### Environment Configuration
See `config.js` and `.env` for connection settings.

---

**Last Updated**: May 21, 2026
