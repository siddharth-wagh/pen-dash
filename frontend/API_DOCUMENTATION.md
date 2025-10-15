# Scribe's Eye API Documentation

Base URL: `http://localhost:5000/api`

## Projects

### Get All Projects
```
GET /projects
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "The Dragon's Quest",
    "description": "An epic fantasy adventure",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
]
```

---

### Get Project by ID
```
GET /projects/:id
```

**Response:**
```json
{
  "id": 1,
  "title": "The Dragon's Quest",
  "description": "An epic fantasy adventure",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

---

### Create Project
```
POST /projects
```

**Request Body:**
```json
{
  "title": "New Project Title",
  "description": "Project description"
}
```

**Response:**
```json
{
  "id": 2,
  "title": "New Project Title",
  "description": "Project description",
  "created_at": "2024-03-15T10:00:00Z",
  "updated_at": "2024-03-15T10:00:00Z"
}
```

---

### Update Project
```
PUT /projects/:id
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Updated Title",
  "description": "Updated description",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-03-15T11:00:00Z"
}
```

---

### Delete Project
```
DELETE /projects/:id
```

**Response:**
```json
{
  "message": "Project deleted successfully"
}
```

---

## Scripts

### Get Scripts by Project
```
GET /projects/:projectId/scripts
```

**Response:**
```json
[
  {
    "id": 1,
    "project_id": 1,
    "title": "Chapter 1: The Awakening",
    "content": "The morning sun cast long shadows...",
    "created_at": "2024-01-16T10:00:00Z",
    "updated_at": "2024-01-16T10:00:00Z"
  }
]
```

---

### Get Script by ID
```
GET /scripts/:id
```

**Response:**
```json
{
  "id": 1,
  "project_id": 1,
  "title": "Chapter 1: The Awakening",
  "content": "The morning sun cast long shadows...",
  "created_at": "2024-01-16T10:00:00Z",
  "updated_at": "2024-01-16T10:00:00Z"
}
```

---

### Create Script
```
POST /projects/:projectId/scripts
```

**Request Body:**
```json
{
  "title": "New Chapter",
  "content": "Chapter content here (optional)"
}
```

**Response:**
```json
{
  "id": 2,
  "project_id": 1,
  "title": "New Chapter",
  "content": "Chapter content here",
  "created_at": "2024-03-15T10:00:00Z",
  "updated_at": "2024-03-15T10:00:00Z"
}
```

---

### Update Script
```
PUT /scripts/:id
```

**Request Body:**
```json
{
  "title": "Updated Chapter Title",
  "content": "Updated content"
}
```

**Response:**
```json
{
  "id": 1,
  "project_id": 1,
  "title": "Updated Chapter Title",
  "content": "Updated content",
  "created_at": "2024-01-16T10:00:00Z",
  "updated_at": "2024-03-15T11:00:00Z"
}
```

---

### Delete Script
```
DELETE /scripts/:id
```

**Response:**
```json
{
  "message": "Script deleted successfully"
}
```

---

### Analyze Script
```
POST /scripts/:id/analyze
```

**Description:** Triggers AI analysis to extract entities (characters, locations, events) from the script content.

**Response:**
```json
{
  "message": "Analysis started",
  "task_id": "task_abc123def456"
}
```

---

### Get Task Status
```
GET /tasks/:taskId/status
```

**Description:** Poll this endpoint to check analysis progress.

**Response (Processing):**
```json
{
  "status": "PROCESSING"
}
```

**Response (Completed):**
```json
{
  "status": "COMPLETED",
  "result": {
    "entities_extracted": 15,
    "characters": 5,
    "locations": 7,
    "events": 3
  }
}
```

**Response (Failed):**
```json
{
  "status": "FAILED",
  "error": "Error message describing what went wrong"
}
```

---

## Entities

### Get Entities by Project
```
GET /projects/:projectId/entities
```

**Query Parameters:**
- `type` (optional): Filter by entity type (`character`, `location`, `event`)

**Example:**
```
GET /projects/1/entities?type=character
```

**Response:**
```json
[
  {
    "id": 1,
    "script_id": 1,
    "type": "character",
    "name": "Aric",
    "description": "Young hero destined to save the kingdom",
    "attributes": {
      "age": 16,
      "role": "protagonist",
      "abilities": ["courage", "swordsmanship"]
    },
    "created_at": "2024-01-16T11:00:00Z"
  }
]
```

---

### Get Entity by ID
```
GET /entities/:id
```

**Response:**
```json
{
  "id": 1,
  "script_id": 1,
  "type": "character",
  "name": "Aric",
  "description": "Young hero destined to save the kingdom",
  "attributes": {
    "age": 16,
    "role": "protagonist",
    "abilities": ["courage", "swordsmanship"]
  },
  "created_at": "2024-01-16T11:00:00Z"
}
```

---

## Q&A (Question & Answer)

### Ask Question
```
POST /projects/:projectId/question
```

**Description:** Ask AI-powered questions about the story content.

**Request Body:**
```json
{
  "question": "What is Aric's main motivation?"
}
```

**Response:**
```json
{
  "question": "What is Aric's main motivation?",
  "answer": "Aric is motivated by a desire to protect his village and fulfill his destiny as the chosen hero. His journey is driven by courage and a sense of responsibility to those he loves."
}
```

---

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**
```json
{
  "error": "Validation error message"
}
```

**404 Not Found:**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error message"
}
```

---

## Notes

1. All timestamps are in ISO 8601 format (UTC)
2. All POST/PUT requests should include `Content-Type: application/json` header
3. Entity types are limited to: `character`, `location`, `event`
4. Task status values are: `PROCESSING`, `COMPLETED`, `FAILED`
5. The `attributes` field in entities is a flexible JSON object that can contain any key-value pairs
