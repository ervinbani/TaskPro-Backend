# 🔔 Notification Modal/Popup - Complete Implementation

Guida per creare un **popup modale** per le notifiche, simile al modal dei collaboratori.

---

## 🎨 Preview del Risultato

```
Navbar con campanella:  [🔔 3]  ← Click qui

Appare popup:
┌────────────────────────────────────────────┐
│  Notifiche                           [X]   │
├────────────────────────────────────────────┤
│  [Segna tutte lette] [Cancella lette]     │
├────────────────────────────────────────────┤
│  ● mario ti ha aggiunto al progetto...     │
│    2 minuti fa                      [→]    │
├────────────────────────────────────────────┤
│  ○ luigi ha creato un nuovo task...        │
│    1 ora fa                         [→]    │
├────────────────────────────────────────────┤
│  ● peach ha aggiornato il progetto...      │
│    3 ore fa                         [→]    │
└────────────────────────────────────────────┘
```

- **●** = Non letta (grassetto, sfondo azzurro)
- **○** = Letta (normale, sfondo bianco)

---

## 📁 Struttura File

```
src/
├── components/
│   ├── NotificationBell.jsx      ← Campanella + Badge
│   ├── NotificationModal.jsx     ← Modal popup
│   └── NotificationItem.jsx      ← Singola notifica
├── hooks/
│   └── useNotifications.js       ← Hook per API calls
└── styles/
    └── NotificationModal.css     ← Stili
```

---

## 🚀 STEP 1: Hook per le Notifiche

Crea `src/hooks/useNotifications.js`:

```javascript
import { useState, useEffect, useCallback } from "react";

const API_BASE_URL = "http://localhost:3000/api";

export const useNotifications = (token) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Polling automatico per il counter
  useEffect(() => {
    if (!token) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/notifications/unread/count`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!response.ok) throw new Error("Failed to fetch count");
        const data = await response.json();
        setUnreadCount(data.count);
      } catch (err) {
        console.error("Error fetching notification count:", err);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // Fetch lista completa
  const fetchNotifications = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/notifications?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch notifications");
      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Segna come letta
  const markAsRead = useCallback(
    async (notificationId) => {
      if (!token) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/notifications/${notificationId}/read`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!response.ok) throw new Error("Failed to mark as read");

        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notificationId ? { ...n, isRead: true } : n,
          ),
        );
      } catch (err) {
        console.error("Error marking as read:", err);
      }
    },
    [token],
  );

  // Segna tutte come lette
  const markAllAsRead = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/mark-all-read`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!response.ok) throw new Error("Failed to mark all as read");

      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  }, [token]);

  // Elimina notifica
  const deleteNotification = useCallback(
    async (notificationId) => {
      if (!token) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/notifications/${notificationId}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!response.ok) throw new Error("Failed to delete notification");

        const deletedNotif = notifications.find(
          (n) => n._id === notificationId,
        );
        if (deletedNotif && !deletedNotif.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        setNotifications((prev) =>
          prev.filter((n) => n._id !== notificationId),
        );
      } catch (err) {
        console.error("Error deleting notification:", err);
      }
    },
    [token, notifications],
  );

  // Cancella tutte le lette
  const clearReadNotifications = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/clear-read`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to clear read notifications");

      setNotifications((prev) => prev.filter((n) => !n.isRead));
    } catch (err) {
      console.error("Error clearing read notifications:", err);
    }
  }, [token]);

  return {
    unreadCount,
    notifications,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
  };
};
```

---

## 🔔 STEP 2: Componente Campanella

Crea `src/components/NotificationBell.jsx`:

```javascript
import React, { useState } from "react";
import { useNotifications } from "../hooks/useNotifications";
import NotificationModal from "./NotificationModal";

const NotificationBell = ({ token }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    unreadCount,
    notifications,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
  } = useNotifications(token);

  const handleBellClick = () => {
    setIsModalOpen(true);
    fetchNotifications(); // Carica notifiche quando apri
  };

  return (
    <>
      {/* Campanella con Badge */}
      <button
        onClick={handleBellClick}
        className="notification-bell-button"
        aria-label="Notifiche"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Modal */}
      <NotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        isLoading={isLoading}
        error={error}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDelete={deleteNotification}
        onClearRead={clearReadNotifications}
      />
    </>
  );
};

export default NotificationBell;
```

---

## 🪟 STEP 3: Modal Popup

Crea `src/components/NotificationModal.jsx`:

```javascript
import React from "react";
import NotificationItem from "./NotificationItem";
import "../styles/NotificationModal.css";

const NotificationModal = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  isLoading,
  error,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearRead,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay di sfondo */}
      <div className="modal-overlay" onClick={onClose} />

      {/* Modal */}
      <div className="notification-modal">
        {/* Header */}
        <div className="modal-header">
          <h2>Notifiche</h2>
          <button
            className="modal-close-button"
            onClick={onClose}
            aria-label="Chiudi"
          >
            ✕
          </button>
        </div>

        {/* Azioni */}
        {notifications.length > 0 && (
          <div className="modal-actions">
            {unreadCount > 0 && (
              <button
                className="action-button primary"
                onClick={onMarkAllAsRead}
              >
                Segna tutte lette
              </button>
            )}
            <button className="action-button secondary" onClick={onClearRead}>
              Cancella lette
            </button>
          </div>
        )}

        {/* Body */}
        <div className="modal-body">
          {isLoading ? (
            <div className="modal-loading">
              <div className="spinner"></div>
              <p>Caricamento...</p>
            </div>
          ) : error ? (
            <div className="modal-error">
              <p>⚠️ Errore nel caricamento delle notifiche</p>
              <small>{error}</small>
            </div>
          ) : notifications.length === 0 ? (
            <div className="modal-empty">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <p>Nessuna notifica</p>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationModal;
```

---

## 📄 STEP 4: Singola Notifica

Crea `src/components/NotificationItem.jsx`:

```javascript
import React from "react";
import { useNavigate } from "react-router-dom"; // Se usi React Router

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Segna come letta se non lo è
    if (!notification.isRead) {
      onMarkAsRead(notification._id);
    }

    // Naviga al progetto/task
    if (notification.project?._id) {
      navigate(`/projects/${notification.project._id}`);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Previeni click sulla notifica
    onDelete(notification._id);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Proprio ora";
    if (diffMins < 60) return `${diffMins} minuti fa`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24)
      return `${diffHours} ${diffHours === 1 ? "ora" : "ore"} fa`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ${diffDays === 1 ? "giorno" : "giorni"} fa`;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "PROJECT_INVITE":
        return "👥";
      case "PROJECT_REMOVED":
        return "❌";
      case "PROJECT_UPDATED":
        return "✏️";
      case "PROJECT_DELETED":
        return "🗑️";
      case "TASK_CREATED":
        return "➕";
      case "TASK_STATUS_CHANGED":
        return "🔄";
      case "TASK_DELETED":
        return "🗑️";
      default:
        return "📬";
    }
  };

  return (
    <div
      className={`notification-item ${notification.isRead ? "read" : "unread"}`}
      onClick={handleClick}
    >
      {/* Icona tipo notifica */}
      <div className="notification-icon">{getTypeIcon(notification.type)}</div>

      {/* Contenuto */}
      <div className="notification-content">
        <p className="notification-message">{notification.message}</p>
        <div className="notification-meta">
          <span className="notification-time">
            {formatDate(notification.createdAt)}
          </span>
          {notification.project && (
            <span className="notification-project">
              📁 {notification.project.name}
            </span>
          )}
        </div>
      </div>

      {/* Pulsanti azioni */}
      <div className="notification-actions">
        <button className="action-icon" onClick={handleDelete} title="Elimina">
          ✕
        </button>
        {notification.project?._id && (
          <button className="action-icon go-to" title="Vai al progetto">
            →
          </button>
        )}
      </div>
    </div>
  );
};

export default NotificationItem;
```

---

## 🎨 STEP 5: Stili CSS

Crea `src/styles/NotificationModal.css`:

```css
/* ===== CAMPANELLA ===== */
.notification-bell-button {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #333;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-bell-button:hover {
  color: #007bff;
}

.notification-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #dc3545;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  line-height: 1;
}

/* ===== MODAL OVERLAY ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* ===== MODAL POPUP ===== */
.notification-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translate(-50%, -45%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

/* ===== HEADER ===== */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
}

.modal-close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px 8px;
  line-height: 1;
  transition: color 0.2s;
}

.modal-close-button:hover {
  color: #1f2937;
}

/* ===== AZIONI ===== */
.modal-actions {
  display: flex;
  gap: 8px;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.action-button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button.primary {
  background: #007bff;
  color: white;
}

.action-button.primary:hover {
  background: #0056b3;
}

.action-button.secondary {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.action-button.secondary:hover {
  background: #f3f4f6;
}

/* ===== BODY ===== */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

/* Stati speciali */
.modal-loading,
.modal-error,
.modal-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
  color: #6b7280;
}

.modal-loading .spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #007bff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.modal-error {
  color: #dc2626;
}

.modal-empty svg {
  stroke: #d1d5db;
  margin-bottom: 16px;
}

/* ===== LISTA NOTIFICHE ===== */
.notification-list {
  display: flex;
  flex-direction: column;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f9fafb;
}

.notification-item:last-child {
  border-bottom: none;
}

/* Non letta */
.notification-item.unread {
  background-color: #eff6ff;
}

.notification-item.unread:hover {
  background-color: #dbeafe;
}

.notification-item.unread .notification-message {
  font-weight: 600;
  color: #1f2937;
}

/* Letta */
.notification-item.read .notification-message {
  color: #6b7280;
}

/* ===== ICONA TIPO ===== */
.notification-icon {
  font-size: 24px;
  line-height: 1;
  flex-shrink: 0;
}

/* ===== CONTENUTO ===== */
.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-message {
  margin: 0 0 8px 0;
  font-size: 14px;
  line-height: 1.5;
}

.notification-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #9ca3af;
}

.notification-project {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* ===== AZIONI NOTIFICA ===== */
.notification-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.notification-item:hover .notification-actions {
  opacity: 1;
}

.action-icon {
  background: none;
  border: none;
  font-size: 18px;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.action-icon:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.action-icon.go-to {
  color: #007bff;
}

.action-icon.go-to:hover {
  background: #eff6ff;
  color: #0056b3;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 640px) {
  .notification-modal {
    width: 100%;
    max-width: none;
    max-height: 100vh;
    border-radius: 0;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transform: none;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .modal-header {
    padding: 16px;
  }

  .modal-actions {
    padding: 12px 16px;
  }

  .notification-item {
    padding: 12px 16px;
  }
}
```

---

## 🔌 STEP 6: Integrazione nel Layout

Nel tuo `App.jsx` o `Header.jsx`:

```javascript
import React from "react";
import NotificationBell from "./components/NotificationBell";

function Header() {
  const token = localStorage.getItem("token"); // O dal tuo context/redux

  return (
    <header className="app-header">
      <nav className="navbar">
        <h1>TaskPro</h1>

        <div className="nav-right">
          {token && (
            <>
              <NotificationBell token={token} />
              <button onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
```

---

## 🎯 Features Implementate

✅ **Popup Modal** centrato sullo schermo  
✅ **Badge** con numero notifiche non lette  
✅ **Icone** diverse per tipo notifica (👥, ➕, 🔄, etc.)  
✅ **Colori** diversi: azzurro per non lette, bianco per lette  
✅ **Timestamp** formattato ("2 minuti fa", "3 ore fa")  
✅ **Pulsanti azione**: Segna tutte, Cancella lette  
✅ **Click notifica**: segna come letta + naviga al progetto  
✅ **Elimina singola** notifica con pulsante X  
✅ **Responsive**: si adatta a mobile  
✅ **Animazioni**: fade in overlay, slide up modal  
✅ **Loading state** con spinner  
✅ **Empty state** quando nessuna notifica  
✅ **Error handling** per problemi di rete

---

## 🧪 Test del Popup

1. **Avvia il server backend:**

   ```bash
   npm run dev
   ```

2. **Crea notifiche** (con Postman):
   - Registra 2 utenti
   - Mario aggiunge Luigi a progetto
   - Mario crea task

3. **Nel frontend**:
   - Fai login come Luigi
   - Clicca la campanella 🔔
   - Dovresti vedere il **popup centrato** con le notifiche

4. **Test interazioni**:
   - Click "Segna tutte lette" → Badge va a 0
   - Click su notifica → Naviga al progetto
   - Click X → Elimina notifica
   - Click "Cancella lette" → Rimuove tutte quelle lette

---

## 🎨 Personalizzazione

### Cambiare Colori

```css
/* In NotificationModal.css */

/* Tema Scuro */
.notification-modal {
  background: #1f2937;
  color: white;
}

/* Colore Badge */
.notification-badge {
  background: #10b981; /* Verde invece di rosso */
}

/* Notifiche non lette */
.notification-item.unread {
  background-color: #fef3c7; /* Giallo invece di azzurro */
}
```

### Posizione Modal

```css
/* Top-right invece di centro */
.notification-modal {
  top: 80px;
  left: auto;
  right: 20px;
  transform: none;
  max-width: 420px;
}
```

---

## 🚀 Pronto da Usare!

Semplicemente:

1. **Copia** tutti i file nelle rispettive cartelle
2. **Importa** NotificationBell nel tuo Header
3. **Passa** il token JWT come prop
4. **Enjoy!** 🎉

Il popup funzionerà esattamente come il modal dei collaboratori! ✨
