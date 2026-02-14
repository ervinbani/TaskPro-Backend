# 🧪 Testing Guide - Notification System

Guida per testare il sistema di notifiche con Postman/Thunder Client.

---

## 🚀 Setup Iniziale

### 1. Avvia il Server

```bash
npm run dev
```

### 2. Prepara Due Utenti

**Utente 1 - Mario (Owner)**

```
POST http://localhost:3000/api/user/register
{
  "username": "mario",
  "email": "mario@test.com",
  "password": "password123"
}
```

💾 **Salva il token di Mario**

**Utente 2 - Luigi (Collaborator)**

```
POST http://localhost:3000/api/user/register
{
  "username": "luigi",
  "email": "luigi@test.com",
  "password": "password123"
}
```

💾 **Salva il token di Luigi**

---

## 📋 Test Scenarios

### Scenario 1: Notifica PROJECT_INVITE

**Step 1 - Mario crea un progetto**

```
POST http://localhost:3000/api/projects
Authorization: Bearer MARIO_TOKEN
{
  "name": "Website Redesign",
  "description": "A new project"
}
```

💾 **Salva il project ID**

**Step 2 - Mario aggiunge Luigi come collaboratore**

```
POST http://localhost:3000/api/projects/{PROJECT_ID}/collaborators
Authorization: Bearer MARIO_TOKEN
{
  "email": "luigi@test.com"
}
```

**Step 3 - Luigi controlla le notifiche**

```
GET http://localhost:3000/api/notifications/unread/count
Authorization: Bearer LUIGI_TOKEN

Expected Response:
{
  "count": 1
}
```

**Step 4 - Luigi legge le notifiche**

```
GET http://localhost:3000/api/notifications
Authorization: Bearer LUIGI_TOKEN

Expected Response:
[
  {
    "_id": "...",
    "type": "PROJECT_INVITE",
    "message": "mario has added you to the project 'Website Redesign'",
    "sender": { "username": "mario", ... },
    "project": { "_id": "...", "name": "Website Redesign" },
    "isRead": false
  }
]
```

---

### Scenario 2: Notifica TASK_CREATED

**Step 1 - Mario crea un task**

```
POST http://localhost:3000/api/tasks/projects/{PROJECT_ID}/tasks
Authorization: Bearer MARIO_TOKEN
{
  "title": "Design homepage",
  "description": "Create mockup",
  "status": "To Do"
}
```

**Step 2 - Luigi riceve notifica**

```
GET http://localhost:3000/api/notifications/unread/count
Authorization: Bearer LUIGI_TOKEN

Expected Response:
{
  "count": 2
}
```

---

### Scenario 3: Notifica TASK_STATUS_CHANGED

**Step 1 - Luigi cambia lo status del task**

```
PUT http://localhost:3000/api/tasks/{TASK_ID}
Authorization: Bearer LUIGI_TOKEN
{
  "status": "In Progress"
}
```

**Step 2 - Mario riceve notifica**

```
GET http://localhost:3000/api/notifications
Authorization: Bearer MARIO_TOKEN

Expected Response:
[
  {
    "_id": "...",
    "type": "TASK_STATUS_CHANGED",
    "message": "luigi moved 'Design homepage' to In Progress",
    "sender": { "username": "luigi", ... },
    "project": { ... },
    "task": { "title": "Design homepage", ... },
    "data": {
      "oldStatus": "To Do",
      "newStatus": "In Progress"
    },
    "isRead": false
  }
]
```

---

### Scenario 4: Segna come Letta

**Step 1 - Luigi segna una notifica come letta**

```
PUT http://localhost:3000/api/notifications/{NOTIFICATION_ID}/read
Authorization: Bearer LUIGI_TOKEN

Expected Response:
{
  "_id": "...",
  "isRead": true,
  "readAt": "2026-02-08T12:00:00.000Z"
}
```

**Step 2 - Verifica counter**

```
GET http://localhost:3000/api/notifications/unread/count
Authorization: Bearer LUIGI_TOKEN

Expected Response:
{
  "count": 1  // Diminuito di 1
}
```

---

### Scenario 5: Segna Tutte come Lette

```
PUT http://localhost:3000/api/notifications/mark-all-read
Authorization: Bearer LUIGI_TOKEN

Expected Response:
{
  "message": "All notifications marked as read",
  "modifiedCount": 2
}
```

---

### Scenario 6: Notifica PROJECT_DELETED

**Step 1 - Mario elimina il progetto**

```
DELETE http://localhost:3000/api/projects/{PROJECT_ID}
Authorization: Bearer MARIO_TOKEN
```

**Step 2 - Luigi riceve notifica**

```
GET http://localhost:3000/api/notifications
Authorization: Bearer LUIGI_TOKEN

Expected Response:
[
  {
    "_id": "...",
    "type": "PROJECT_DELETED",
    "message": "The project 'Website Redesign' has been deleted",
    "sender": { "username": "mario", ... },
    "isRead": false
  }
]
```

---

### Scenario 7: Elimina Notifica

```
DELETE http://localhost:3000/api/notifications/{NOTIFICATION_ID}
Authorization: Bearer LUIGI_TOKEN

Expected Response:
{
  "message": "Notification deleted successfully"
}
```

---

### Scenario 8: Cancella Tutte le Lette

```
DELETE http://localhost:3000/api/notifications/clear-read
Authorization: Bearer LUIGI_TOKEN

Expected Response:
{
  "message": "Read notifications cleared",
  "deletedCount": 5
}
```

---

## 🔍 Test Edge Cases

### Test 1: Non Ricevi Notifiche per le Tue Azioni

**Mario crea un task**

```
POST http://localhost:3000/api/tasks/projects/{PROJECT_ID}/tasks
Authorization: Bearer MARIO_TOKEN
{ "title": "My task" }
```

**Mario controlla le sue notifiche**

```
GET http://localhost:3000/api/notifications/unread/count
Authorization: Bearer MARIO_TOKEN

Expected: count = 0 (non deve ricevere notifica per sua azione)
```

---

### Test 2: Notifiche Solo per Membri del Progetto

**Utente 3 (non membro) non riceve notifiche**

```
# Registra utente3
POST http://localhost:3000/api/user/register
{ "username": "peach", "email": "peach@test.com", "password": "password123" }

# Controlla notifiche
GET http://localhost:3000/api/notifications/unread/count
Authorization: Bearer PEACH_TOKEN

Expected: count = 0
```

---

### Test 3: Query Parameters

**Pagination**

```
GET http://localhost:3000/api/notifications?limit=5&skip=0
Authorization: Bearer LUIGI_TOKEN
```

**Solo Non Lette**

```
GET http://localhost:3000/api/notifications?unreadOnly=true
Authorization: Bearer LUIGI_TOKEN
```

---

## 📊 Tipi di Notifiche - Riepilogo

| Type                  | Quando Viene Creata                | Chi la Riceve         |
| --------------------- | ---------------------------------- | --------------------- |
| `PROJECT_INVITE`      | Aggiungi collaboratore             | Nuovo collaboratore   |
| `PROJECT_REMOVED`     | Rimuovi collaboratore              | Collaboratore rimosso |
| `PROJECT_UPDATED`     | Modifica nome/descrizione progetto | Tutti i collaboratori |
| `PROJECT_DELETED`     | Elimina progetto                   | Tutti i collaboratori |
| `TASK_CREATED`        | Crea task                          | Owner + collaboratori |
| `TASK_STATUS_CHANGED` | Cambia status task                 | Owner + collaboratori |
| `TASK_DELETED`        | Elimina task                       | Owner + collaboratori |

**Importante:** L'autore dell'azione NON riceve mai notifica per le proprie azioni.

---

## 🎯 Postman Collection

Puoi importare questa collection in Postman:

```json
{
  "info": {
    "name": "TaskPro - Notifications",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000/api"
    },
    {
      "key": "mario_token",
      "value": ""
    },
    {
      "key": "luigi_token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Get Unread Count",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{luigi_token}}"
          }
        ],
        "url": "{{base_url}}/notifications/unread/count"
      }
    },
    {
      "name": "Get All Notifications",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{luigi_token}}"
          }
        ],
        "url": "{{base_url}}/notifications"
      }
    },
    {
      "name": "Mark As Read",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{luigi_token}}"
          }
        ],
        "url": "{{base_url}}/notifications/:notificationId/read"
      }
    },
    {
      "name": "Mark All As Read",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{luigi_token}}"
          }
        ],
        "url": "{{base_url}}/notifications/mark-all-read"
      }
    }
  ]
}
```

---

## ✅ Expected Behavior Checklist

- [ ] Polling ogni 30 sec mostra nuovo counter
- [ ] Badge mostra numero corretto di notifiche non lette
- [ ] Clicking su notifica naviga al progetto/task
- [ ] Notifiche marcate come lette diminuiscono il counter
- [ ] Auto-delete dopo 30 giorni (TTL index)
- [ ] Non si ricevono notifiche per proprie azioni
- [ ] Solo membri del progetto ricevono notifiche
- [ ] Notifiche persistono tra sessioni (stored in DB)

---

**Happy Testing! 🎉**
