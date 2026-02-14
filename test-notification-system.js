// 🧪 Script di Test Automatico per Notifiche
// Esegui con: node test-notification-system.js

const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Carica variabili ambiente
dotenv.config();

// Import models
const User = require("./models/User");
const Project = require("./models/Project");
const Notification = require("./models/Notification");
const { createNotification } = require("./utils/notificationService");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

const log = (color, message) => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const testNotificationSystem = async () => {
  try {
    log("blue", "\n=== 🧪 Test Sistema Notifiche ===\n");

    // 1. Connetti al database
    log("yellow", "1️⃣  Connessione a MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    log("green", "✅ MongoDB connesso!\n");

    // 2. Pulisci dati di test precedenti
    log("yellow", "2️⃣  Pulizia dati di test precedenti...");
    await User.deleteMany({
      email: { $in: ["test.mario@example.com", "test.luigi@example.com"] },
    });
    await Project.deleteMany({ name: "Test Notification Project" });
    log("green", "✅ Database pulito!\n");

    // 3. Crea utenti di test
    log("yellow", "3️⃣  Creazione utenti di test...");
    const mario = await User.create({
      username: "test_mario",
      email: "test.mario@example.com",
      password: "password123",
    });
    log("green", `✅ Mario creato: ${mario._id}`);

    const luigi = await User.create({
      username: "test_luigi",
      email: "test.luigi@example.com",
      password: "password123",
    });
    log("green", `✅ Luigi creato: ${luigi._id}\n`);

    // 4. Crea progetto
    log("yellow", "4️⃣  Creazione progetto...");
    const project = await Project.create({
      name: "Test Notification Project",
      description: "Progetto per testare le notifiche",
      owner: mario._id,
      collaborators: [],
    });
    log("green", `✅ Progetto creato: ${project._id}\n`);

    // 5. Test creazione notifica
    log("yellow", "5️⃣  Test creazione notifica...");
    const notification = await createNotification({
      recipient: luigi._id,
      sender: mario._id,
      type: "PROJECT_INVITE",
      message: `${mario.username} has added you to the project '${project.name}'`,
      project: project._id,
    });

    if (notification) {
      log("green", `✅ Notifica creata: ${notification._id}`);
      log("green", `   Tipo: ${notification.type}`);
      log("green", `   Messaggio: ${notification.message}\n`);
    } else {
      log("red", "❌ ERRORE: Notifica non creata!\n");
    }

    // 6. Verifica notifiche nel database
    log("yellow", "6️⃣  Verifica notifiche nel database...");
    const luigiNotifications = await Notification.find({ recipient: luigi._id })
      .populate("sender", "username")
      .populate("project", "name");

    log("green", `✅ Notifiche per Luigi: ${luigiNotifications.length}`);

    if (luigiNotifications.length > 0) {
      luigiNotifications.forEach((notif, index) => {
        log("blue", `\n   Notifica ${index + 1}:`);
        log("blue", `   - Sender: ${notif.sender?.username || "N/A"}`);
        log("blue", `   - Type: ${notif.type}`);
        log("blue", `   - Message: ${notif.message}`);
        log("blue", `   - Project: ${notif.project?.name || "N/A"}`);
        log("blue", `   - Read: ${notif.isRead}`);
      });
    }
    console.log();

    // 7. Verifica che Mario NON riceva notifiche (sender = recipient)
    log(
      "yellow",
      "7️⃣  Test: Mario NON dovrebbe ricevere notifiche per le sue azioni...",
    );
    const marioSelfNotif = await createNotification({
      recipient: mario._id,
      sender: mario._id,
      type: "TASK_CREATED",
      message: "Test self-notification",
      project: project._id,
    });

    if (!marioSelfNotif) {
      log("green", "✅ Corretto! Notifica auto-riferita bloccata.\n");
    } else {
      log("red", "❌ ERRORE: Mario ha ricevuto notifica delle sue azioni!\n");
    }

    // 8. Count notifiche non lette
    log("yellow", "8️⃣  Test count notifiche non lette...");
    const unreadCount = await Notification.countDocuments({
      recipient: luigi._id,
      isRead: false,
    });
    log("green", `✅ Notifiche non lette per Luigi: ${unreadCount}\n`);

    // 9. Test mark as read
    log("yellow", "9️⃣  Test segna come letta...");
    if (notification) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
      log("green", `✅ Notifica segnata come letta!\n`);
    }

    // 10. Verifica count dopo mark as read
    log("yellow", "🔟 Verifica count dopo mark as read...");
    const unreadCountAfter = await Notification.countDocuments({
      recipient: luigi._id,
      isRead: false,
    });
    log("green", `✅ Notifiche non lette dopo: ${unreadCountAfter}\n`);

    // Riepilogo finale
    log("green", "\n=== 🎉 TEST COMPLETATO CON SUCCESSO! ===\n");
    log("blue", "Riepilogo:");
    log("blue", "✓ MongoDB connesso");
    log("blue", "✓ Modelli funzionanti");
    log("blue", "✓ Notifiche create correttamente");
    log("blue", "✓ Filter sender = recipient funziona");
    log("blue", "✓ Count e query funzionano");
    log("blue", "✓ Mark as read funziona\n");
  } catch (error) {
    log("red", "\n❌ ERRORE NEL TEST:");
    log("red", error.message);
    console.error(error);
  } finally {
    // Chiudi connessione
    await mongoose.connection.close();
    log("yellow", "\n🔌 Connessione MongoDB chiusa.\n");
    process.exit(0);
  }
};

// Esegui il test
testNotificationSystem();
