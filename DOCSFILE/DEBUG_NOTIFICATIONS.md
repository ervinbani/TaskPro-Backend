# 🔍 Debug: Perché Non Vedo Notifiche?

## ✅ Checklist Rapida

### 1️⃣ **Server Avviato?**

Apri il terminal e verifica:

```bash
npm run dev
```

Dovresti vedere:

```
Server is running on port 3000
MongoDB connected: ...
```

---

### 2️⃣ **Test Completo con Postman** (Passo-Passo)

## 🧪 Test Manuale - Copia e Incolla

### **STEP 1: Crea Utente 1 (Mario)**

```
POST http://localhost:3000/api/user/register

Headers:
Content-Type: application/json

Body:
{
  "username": "mario",
  "email": "mario@test.com",
  "password": "password123"
}
```

✅ **Risposta Attesa:**

```json
{
  "_id": "xxx",
  "username": "mario",
  "email": "mario@test.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5..."  ← COPIA QUESTO TOKEN!
}
```

📋 **SALVA IL TOKEN DI MARIO:** `______________________`

---

### **STEP 2: Crea Utente 2 (Luigi)**

```
POST http://localhost:3000/api/user/register

Headers:
Content-Type: application/json

Body:
{
  "username": "luigi",
  "email": "luigi@test.com",
  "password": "password123"
}
```

✅ **Risposta Attesa:**

```json
{
  "_id": "yyy",
  "username": "luigi",
  "email": "luigi@test.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5..."  ← COPIA QUESTO TOKEN!
}
```

📋 **SALVA IL TOKEN DI LUIGI:** `______________________`

---

### **STEP 3: Mario Crea un Progetto**

```
POST http://localhost:3000/api/projects

Headers:
Content-Type: application/json
Authorization: Bearer [TOKEN_DI_MARIO]

Body:
{
  "name": "Test Notifiche",
  "description": "Progetto per testare le notifiche"
}
```

✅ **Risposta Attesa:**

```json
{
  "_id": "proj123",  ← COPIA QUESTO ID!
  "name": "Test Notifiche",
  "description": "Progetto per testare le notifiche",
  "owner": "xxx",
  "collaborators": []
}
```

📋 **SALVA IL PROJECT ID:** `______________________`

---

### **STEP 4: 🔔 Mario Aggiunge Luigi come Collaboratore**

**⚠️ QUESTO CREA LA PRIMA NOTIFICA!**

```
POST http://localhost:3000/api/projects/[PROJECT_ID]/collaborators

Headers:
Content-Type: application/json
Authorization: Bearer [TOKEN_DI_MARIO]

Body:
{
  "email": "luigi@test.com"
}
```

✅ **Risposta Attesa:**

```json
{
  "_id": "proj123",
  "name": "Test Notifiche",
  "owner": "xxx",
  "collaborators": [
    {
      "_id": "yyy",
      "username": "luigi",
      "email": "luigi@test.com"
    }
  ]
}
```

---

### **STEP 5: 🎯 Luigi Controlla le Notifiche**

**A) Prima controlla il counter:**

```
GET http://localhost:3000/api/notifications/unread/count

Headers:
Authorization: Bearer [TOKEN_DI_LUIGI]
```

✅ **Risposta Attesa:**

```json
{
  "count": 1  ✅ SE VEDI QUESTO, FUNZIONA!
}
```

❌ **Se vedi:**

```json
{
  "count": 0
}
```

→ Le notifiche NON vengono create. Vai a TROUBLESHOOTING sotto.

---

**B) Poi prendi la lista completa:**

```
GET http://localhost:3000/api/notifications

Headers:
Authorization: Bearer [TOKEN_DI_LUIGI]
```

✅ **Risposta Attesa:**

```json
[
  {
    "_id": "notif123",
    "recipient": "yyy",
    "sender": {
      "_id": "xxx",
      "username": "mario",
      "email": "mario@test.com"
    },
    "type": "PROJECT_INVITE",
    "message": "mario has added you to the project 'Test Notifiche'",
    "project": {
      "_id": "proj123",
      "name": "Test Notifiche"
    },
    "task": null,
    "isRead": false,
    "readAt": null,
    "data": {},
    "createdAt": "2026-02-08T...",
    "updatedAt": "2026-02-08T..."
  }
]
```

🎉 **SE VEDI QUESTO, LE NOTIFICHE FUNZIONANO!**

---

### **STEP 6: Test Altri Tipi di Notifiche**

**Crea un Task (Mario):**

```
POST http://localhost:3000/api/tasks/projects/[PROJECT_ID]/tasks

Headers:
Content-Type: application/json
Authorization: Bearer [TOKEN_DI_MARIO]

Body:
{
  "title": "Test task",
  "description": "Un task di prova",
  "status": "To Do"
}
```

**Luigi controlla di nuovo:**

```
GET http://localhost:3000/api/notifications/unread/count

Headers:
Authorization: Bearer [TOKEN_DI_LUIGI]
```

✅ **Dovrebbe mostrare:** `{ "count": 2 }`

---

## 🔧 TROUBLESHOOTING

### ❌ Problema 1: Count = 0 (Notifiche non create)

**Controlla i log del server:**

```bash
# Nel terminal dove gira il server, cerca errori tipo:
Error creating notification: ...
```

**Verifica che il file esista:**

```bash
dir utils\notificationService.js
```

**Controlla MongoDB:**

- Il database è connesso?
- Nel terminal dovresti vedere: `MongoDB connected: ...`

---

### ❌ Problema 2: Errore 401 Unauthorized

**Causa:** Token non valido o scaduto

**Soluzione:**

1. Rifai login:

```
POST http://localhost:3000/api/user/login
{
  "email": "luigi@test.com",
  "password": "password123"
}
```

2. Usa il nuovo token

---

### ❌ Problema 3: Errore 404 Not Found

**Causa:** Endpoint sbagliato

**Verifica l'URL:**

- ✅ `http://localhost:3000/api/notifications/unread/count`
- ❌ `http://localhost:3000/notifications/unread/count` (manca /api)

---

### ❌ Problema 4: Mario riceve notifiche (sbagliato!)

**Causa:** L'owner non dovrebbe ricevere notifiche delle sue azioni

**Verifica:**

```
GET http://localhost:3000/api/notifications/unread/count

Headers:
Authorization: Bearer [TOKEN_DI_MARIO]
```

Dovrebbe restituire: `{ "count": 0 }`

Se Mario vede notifiche per le SUE azioni, c'è un bug nel codice.

---

## 🔍 Debug Avanzato

### **Verifica Database Diretto**

Se hai MongoDB Compass o mongo shell:

```bash
# Connettiti al database
mongo

# Usa il database taskpro
use taskpro

# Conta le notifiche
db.notifications.countDocuments()

# Mostra le notifiche
db.notifications.find().pretty()
```

Dovresti vedere almeno 1 documento.

---

### **Verifica Codice Backend**

**Controlla che il file sia stato importato correttamente:**

```bash
# Apri projectController.js e cerca:
const {
  createNotification,
  createNotifications,
  getProjectMembers,
} = require("../utils/notificationService");
```

Se manca, il sistema non funziona.

---

## 🎯 Test Veloce: Script Node.js

Crea un file `test-notifications.js`:

```javascript
const mongoose = require("mongoose");
require("dotenv").config();

const testNotifications = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const Notification = require("./models/Notification");

    const count = await Notification.countDocuments();
    console.log(`📊 Total notifications in DB: ${count}`);

    const notifications = await Notification.find().limit(5);
    console.log("📋 Latest notifications:", notifications);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

testNotifications();
```

Esegui:

```bash
node test-notifications.js
```

---

## ✅ Cosa Fare Se Tutto Funziona?

Se le notifiche funzionano in Postman ma NON nel frontend:

### **Controlla il Frontend:**

1. **Token presente?**

```javascript
console.log("Token:", localStorage.getItem("token"));
```

2. **URL corretta?**

```javascript
// ❌ Sbagliato
fetch("http://localhost:3000/notifications/unread/count");

// ✅ Corretto
fetch("http://localhost:3000/api/notifications/unread/count");
```

3. **Headers corretti?**

```javascript
fetch("http://localhost:3000/api/notifications/unread/count", {
  headers: {
    Authorization: `Bearer ${token}`, // Nota lo spazio dopo Bearer
  },
});
```

4. **Console Errors?**

```javascript
fetch(...)
  .then(res => res.json())
  .then(data => console.log('✅ Notifiche:', data))
  .catch(err => console.error('❌ Errore:', err));
```

---

## 📞 Se Ancora Non Funziona

Condividi queste informazioni:

1. **Output di:**

```bash
GET http://localhost:3000/api/notifications/unread/count
```

2. **Log del server** (copia gli ultimi 20 righe)

3. **Errori nel browser** (apri DevTools → Console)

4. **Versione Node:**

```bash
node --version
```

---

**Segui questi passaggi e fammi sapere dove ti blocchi!** 🚀
