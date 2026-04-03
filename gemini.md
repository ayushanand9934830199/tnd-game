# JSON Data Schema

## 1. User Profile
```json
{
  "id": "UUID",
  "email": "String",
  "created_at": "Timestamp"
}
```

## 2. Question Payload
```json
{
  "id": "UUID",
  "author_id": "UUID",
  "type": "Enum('truth', 'dare', 'rapid_fire')",
  "content": "String",
  "created_at": "Timestamp"
}
```

## 3. Session Payload
```json
{
  "id": "UUID",
  "host_id": "UUID",
  "name": "String",
  "status": "Enum('active', 'finished')",
  "created_at": "Timestamp"
}
```
