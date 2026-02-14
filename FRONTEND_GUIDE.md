# 🎨 Frontend Implementation Guide - Notifications

Guida completa per implementare il sistema di notifiche nel frontend React/Vue/Angular.

---

## 📋 Overview

Il sistema di notifiche usa il **polling** (richieste periodiche ogni 30 secondi) per controllare nuove notifiche. Il backend crea automaticamente notifiche quando:

- Vieni aggiunto/rimosso da un progetto
- Qualcuno modifica un progetto a cui partecipi
- Qualcuno crea/aggiorna/elimina task nei tuoi progetti

---

## 🚀 Quick Start: Implementazione React

### 1. Hook Personalizzato per le Notifiche

Crea un file `hooks/useNotifications.js`:

```javascript
import { useState, useEffect } from "react";

const API_BASE_URL = "http://localhost:3000/api";

const useNotifications = (token) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Polling per il counter del badge
  useEffect(() => {
    if (!token) return;

    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/notifications/unread/count`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!response.ok) throw new Error("Failed to fetch count");

        const data = await response.json();
        setUnreadCount(data.count);
        setError(null);
      } catch (err) {
        console.error("Error fetching notification count:", err);
        setError(err.message);
      }
    };

    // Prima chiamata immediata
    fetchUnreadCount();

    // Polling ogni 30 secondi
    const interval = setInterval(fetchUnreadCount, 30000);

    // Cleanup
    return () => clearInterval(interval);
  }, [token]);

  // Fetch lista notifiche completa (chiamata on-demand)
  const fetchNotifications = async (limit = 20) => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications?limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      setNotifications(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Segna notifica come letta
  const markAsRead = async (notificationId) => {
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

      // Aggiorna stato locale
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n,
        ),
      );
      setError(null);
    } catch (err) {
      console.error("Error marking as read:", err);
      setError(err.message);
    }
  };

  // Segna tutte come lette
  const markAllAsRead = async () => {
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

      // Aggiorna stato locale
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setError(null);
    } catch (err) {
      console.error("Error marking all as read:", err);
      setError(err.message);
    }
  };

  // Elimina notifica
  const deleteNotification = async (notificationId) => {
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

      // Aggiorna stato locale
      const deletedNotif = notifications.find((n) => n._id === notificationId);
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      setError(null);
    } catch (err) {
      console.error("Error deleting notification:", err);
      setError(err.message);
    }
  };

  return {
    unreadCount,
    notifications,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};

export default useNotifications;
```

---

### 2. Componente Campanella Notifiche

Crea `components/NotificationBell.jsx`:

```javascript
import React, { useState } from "react";
import useNotifications from "../hooks/useNotifications";
import "./NotificationBell.css";

const NotificationBell = ({ token }) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    unreadCount,
    notifications,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(token);

  const handleToggle = () => {
    if (!isOpen) {
      fetchNotifications(); // Carica notifiche quando apri
    }
    setIsOpen(!isOpen);
  };

  const handleNotificationClick = async (notification) => {
    // Segna come letta
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }

    // Naviga al progetto o task (opzionale)
    if (notification.project) {
      window.location.href = `/projects/${notification.project._id}`;
    }

    setIsOpen(false);
  };

  const handleDelete = async (e, notificationId) => {
    e.stopPropagation(); // Previene click sulla notifica
    await deleteNotification(notificationId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Proprio ora";
    if (diffMins < 60) return `${diffMins} minuti fa`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} ore fa`;
    return `${Math.floor(diffMins / 1440)} giorni fa`;
  };

  return (
    <div className="notification-bell-container">
      {/* Icona Campanella con Badge */}
      <button onClick={handleToggle} className="bell-button">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Notifiche</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="mark-all-read">
                Segna tutte lette
              </button>
            )}
          </div>

          <div className="dropdown-body">
            {isLoading ? (
              <p className="loading">Caricamento...</p>
            ) : error ? (
              <p className="error">{error}</p>
            ) : notifications.length === 0 ? (
              <p className="empty">Nessuna notifica</p>
            ) : (
              <ul className="notification-list">
                {notifications.map((notif) => (
                  <li
                    key={notif._id}
                    className={`notification-item ${notif.isRead ? "read" : "unread"}`}
                    onClick={() => handleNotificationClick(notif)}
                  >
                    <div className="notification-content">
                      <p className="notification-message">{notif.message}</p>
                      <small className="notification-time">
                        {formatDate(notif.createdAt)}
                      </small>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, notif._id)}
                      className="delete-button"
                      title="Elimina"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Overlay per chiudere il dropdown */}
      {isOpen && <div className="overlay" onClick={() => setIsOpen(false)} />}
    </div>
  );
};

export default NotificationBell;
```

---

### 3. Stili CSS

Crea `components/NotificationBell.css`:

```css
.notification-bell-container {
  position: relative;
}

/* Bottone Campanella */
.bell-button {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #333;
  transition: color 0.2s;
}

.bell-button:hover {
  color: #007bff;
}

.bell-button svg {
  display: block;
}

/* Badge Contador */
.badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #dc3545;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

/* Dropdown Menu */
.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  width: 380px;
  max-height: 500px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

/* Header */
.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.dropdown-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.mark-all-read {
  background: none;
  border: none;
  color: #007bff;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
}

.mark-all-read:hover {
  text-decoration: underline;
}

/* Body */
.dropdown-body {
  max-height: 400px;
  overflow-y: auto;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 32px 16px;
  color: #666;
}

.error {
  color: #dc3545;
}

/* Lista Notifiche */
.notification-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f8f9fa;
}

.notification-item.unread {
  background-color: #e7f3ff;
}

.notification-item.unread:hover {
  background-color: #d0e8ff;
}

.notification-content {
  flex: 1;
}

.notification-message {
  margin: 0 0 4px 0;
  font-size: 14px;
  line-height: 1.4;
  color: #333;
}

.notification-time {
  font-size: 12px;
  color: #999;
}

.delete-button {
  background: none;
  border: none;
  color: #999;
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
  margin-left: 8px;
  opacity: 0;
  transition:
    opacity 0.2s,
    color 0.2s;
}

.notification-item:hover .delete-button {
  opacity: 1;
}

.delete-button:hover {
  color: #dc3545;
}

/* Overlay */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: transparent;
}

/* Responsive */
@media (max-width: 480px) {
  .notification-dropdown {
    width: 90vw;
    right: 5vw;
  }
}
```

---

### 4. Utilizzo nel Layout Principale

Integra il componente nel tuo layout/navbar:

```javascript
// App.jsx o Layout.jsx
import React, { useState } from "react";
import NotificationBell from "./components/NotificationBell";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  return (
    <div className="app">
      <header>
        <nav>
          <h1>TaskPro</h1>

          {token && (
            <div className="nav-actions">
              {/* Altri elementi della navbar */}
              <NotificationBell token={token} />

              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </nav>
      </header>

      <main>{/* Il resto dell'app */}</main>
    </div>
  );
}

export default App;
```

---

## 🎯 Implementazione Vue.js

### Composable per Vue 3

Crea `composables/useNotifications.js`:

```javascript
import { ref, onMounted, onUnmounted } from "vue";

export function useNotifications(token) {
  const unreadCount = ref(0);
  const notifications = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
  let intervalId = null;

  const API_BASE_URL = "http://localhost:3000/api";

  const fetchUnreadCount = async () => {
    if (!token.value) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/unread/count`,
        {
          headers: { Authorization: `Bearer ${token.value}` },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch count");

      const data = await response.json();
      unreadCount.value = data.count;
      error.value = null;
    } catch (err) {
      console.error("Error fetching notification count:", err);
      error.value = err.message;
    }
  };

  const fetchNotifications = async (limit = 20) => {
    if (!token.value) return;

    isLoading.value = true;
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications?limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token.value}` },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data = await response.json();
      notifications.value = data;
      error.value = null;
    } catch (err) {
      console.error("Error fetching notifications:", err);
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  const markAsRead = async (notificationId) => {
    if (!token.value) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token.value}` },
        },
      );

      if (!response.ok) throw new Error("Failed to mark as read");

      unreadCount.value = Math.max(0, unreadCount.value - 1);
      notifications.value = notifications.value.map((n) =>
        n._id === notificationId ? { ...n, isRead: true } : n,
      );
      error.value = null;
    } catch (err) {
      console.error("Error marking as read:", err);
      error.value = err.message;
    }
  };

  onMounted(() => {
    fetchUnreadCount();
    intervalId = setInterval(fetchUnreadCount, 30000);
  });

  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId);
  });

  return {
    unreadCount,
    notifications,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
  };
}
```

---

## 🎨 Implementazione Angular

### Service per Angular

Crea `services/notification.service.ts`:

```typescript
import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, interval, Observable } from "rxjs";
import { switchMap } from "rxjs/operators";

interface Notification {
  _id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  sender?: { username: string };
  project?: { _id: string; name: string };
  task?: { _id: string; title: string };
}

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  private apiUrl = "http://localhost:3000/api/notifications";
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    // Avvia polling ogni 30 secondi
    this.startPolling();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem("token");
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  private startPolling(): void {
    // Polling ogni 30 secondi
    interval(30000)
      .pipe(switchMap(() => this.fetchUnreadCount()))
      .subscribe();

    // Prima chiamata immediata
    this.fetchUnreadCount().subscribe();
  }

  fetchUnreadCount(): Observable<any> {
    return this.http
      .get<{
        count: number;
      }>(`${this.apiUrl}/unread/count`, { headers: this.getHeaders() })
      .pipe(tap((data) => this.unreadCountSubject.next(data.count)));
  }

  getNotifications(limit = 20): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}?limit=${limit}`, {
      headers: this.getHeaders(),
    });
  }

  markAsRead(notificationId: string): Observable<any> {
    return this.http
      .put(
        `${this.apiUrl}/${notificationId}/read`,
        {},
        { headers: this.getHeaders() },
      )
      .pipe(
        tap(() => {
          const current = this.unreadCountSubject.value;
          this.unreadCountSubject.next(Math.max(0, current - 1));
        }),
      );
  }

  markAllAsRead(): Observable<any> {
    return this.http
      .put(`${this.apiUrl}/mark-all-read`, {}, { headers: this.getHeaders() })
      .pipe(tap(() => this.unreadCountSubject.next(0)));
  }

  deleteNotification(notificationId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${notificationId}`, {
      headers: this.getHeaders(),
    });
  }
}
```

---

## 📱 Best Practices

### 1. **Gestione dello Stato**

- Usa Redux/Vuex/NgRx per app complesse
- Mantieni lo stato delle notifiche globale
- Cache delle notifiche per ridurre chiamate API

### 2. **Performance**

- Non fare polling se l'utente non è loggato
- Ferma il polling quando il tab non è attivo:

```javascript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      clearInterval(intervalId);
    } else {
      startPolling();
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}, []);
```

### 3. **UX Improvements**

- Mostra animazione quando arriva nuova notifica
- Suono opzionale per notifiche (con preferenza utente)
- Toast/Snackbar per notifiche importanti
- Badge con "99+" per numeri alti

### 4. **Error Handling**

- Fallback silenzioso se API fallisce
- Retry automatico con exponential backoff
- Non bloccare l'app se le notifiche falliscono

---

## 🔔 Notifiche Browser (Opzionale)

Per notifiche native del browser:

```javascript
// Richiedi permesso
const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};

// Mostra notifica browser
const showBrowserNotification = (message) => {
  if (Notification.permission === 'granted') {
    new Notification('TaskPro', {
      body: message,
      icon: '/logo.png',
      badge: '/badge.png'
    });
  }
};

// Usa nel polling
useEffect(() => {
  const fetchCount = async () => {
    const response = await fetch(...);
    const data = await response.json();

    if (data.count > previousCount) {
      showBrowserNotification('Hai nuove notifiche!');
    }

    setPreviousCount(data.count);
  };
  // ...
}, []);
```

---

## 🧪 Testing

### Test del Hook (React Testing Library)

```javascript
import { renderHook, waitFor } from "@testing-library/react";
import useNotifications from "./useNotifications";

describe("useNotifications", () => {
  it("should fetch unread count on mount", async () => {
    const { result } = renderHook(() => useNotifications("fake-token"));

    await waitFor(() => {
      expect(result.current.unreadCount).toBeGreaterThanOrEqual(0);
    });
  });

  it("should fetch notifications", async () => {
    const { result } = renderHook(() => useNotifications("fake-token"));

    await result.current.fetchNotifications();

    await waitFor(() => {
      expect(result.current.notifications).toBeInstanceOf(Array);
    });
  });
});
```

---

## 🚀 Deploy Checklist

- [ ] Aggiorna `API_BASE_URL` per produzione
- [ ] Configura CORS sul backend per il dominio frontend
- [ ] Test polling con molte notifiche (performance)
- [ ] Test su diversi browser (Chrome, Firefox, Safari)
- [ ] Test su mobile (responsive)
- [ ] Implementa error boundary per fallimenti delle notifiche
- [ ] Monitora chiamate API (non deve sovraccaricare il server)

---

## 📚 Resources

- [React Hooks Documentation](https://react.dev/reference/react)
- [Vue Composables](https://vuejs.org/guide/reusability/composables.html)
- [Angular Services](https://angular.io/guide/architecture-services)
- [Web Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)

---

**Buon coding! 🎉**
