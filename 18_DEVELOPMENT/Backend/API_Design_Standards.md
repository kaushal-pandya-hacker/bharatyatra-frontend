# API Design Standards — Chalo Farva

## Response Format Standard
All API endpoints return JSON conforming to the unified schema:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": { "count": 24, "limit": 20, "offset": 0 }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Invalid request payload parameters",
    "details": [
      { "field": "email", "message": "Invalid email address format" }
    ]
  }
}
```

## HTTP Status Codes
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully instantiated.
- `400 Bad Request`: Malformed JSON or missing headers.
- `401 Unauthorized`: Missing or invalid JWT.
- `403 Forbidden`: Authenticated user lacks role privileges.
- `404 Not Found`: Target entity missing.
- `422 Unprocessable Entity`: Zod validation error.
- `500 Internal Server Error`: Uncaught server exception.
