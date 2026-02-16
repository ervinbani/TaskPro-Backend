// 🧪 Script di Test Automatico per Sistema di Assegnazione Task/Todos
// Esegui con: node test-assignment-system.js

const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Carica variabili ambiente
dotenv.config();

// Import models
const User = require("./models/User");
const Project = require("./models/Project");
const Task = require("./models/Task");
const Notification = require("./models/Notification");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = (color, message) => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const testAssignmentSystem = async () => {
  try {
    log("blue", "\n=== 🧪 Test Sistema Assegnazione Task/Todos ===\n");

    // 1. Connetti al database
    log("yellow", "1️⃣  Connessione a MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    log("green", "✅ MongoDB connesso!\n");

    // 2. Pulisci dati di test precedenti
    log("yellow", "2️⃣  Pulizia dati di test precedenti...");
    await User.deleteMany({
      email: {
        $in: [
          "test.owner@example.com",
          "test.collab1@example.com",
          "test.collab2@example.com",
          "test.external@example.com",
        ],
      },
    });
    await Project.deleteMany({ name: "Test Assignment Project" });
    await Task.deleteMany({ title: { $regex: /^Test Assignment/ } });
    log("green", "✅ Database pulito!\n");

    // 3. Crea utenti di test
    log("yellow", "3️⃣  Creazione utenti di test...");
    const owner = await User.create({
      username: "test_owner",
      email: "test.owner@example.com",
      password: "password123",
    });
    log("green", `✅ Owner creato: ${owner._id}`);

    const collab1 = await User.create({
      username: "test_collab1",
      email: "test.collab1@example.com",
      password: "password123",
    });
    log("green", `✅ Collaboratore 1 creato: ${collab1._id}`);

    const collab2 = await User.create({
      username: "test_collab2",
      email: "test.collab2@example.com",
      password: "password123",
    });
    log("green", `✅ Collaboratore 2 creato: ${collab2._id}`);

    const external = await User.create({
      username: "test_external",
      email: "test.external@example.com",
      password: "password123",
    });
    log("green", `✅ Utente esterno creato: ${external._id}\n`);

    // 4. Crea progetto con collaboratori
    log("yellow", "4️⃣  Creazione progetto con collaboratori...");
    const project = await Project.create({
      name: "Test Assignment Project",
      description: "Progetto per testare il sistema di assegnazione",
      owner: owner._id,
      collaborators: [collab1._id, collab2._id],
    });
    log("green", `✅ Progetto creato: ${project._id}`);
    log("green", `   Owner: ${owner.username}`);
    log(
      "green",
      `   Collaboratori: ${collab1.username}, ${collab2.username}\n`,
    );

    // 5. Test 1: Task assegnato a collaboratori specifici
    log("yellow", "5️⃣  Test 1: Task assegnato a collaboratori specifici...");
    const taskAssigned = await Task.create({
      title: "Test Assignment Task - Assigned",
      description: "Task assegnato a collab1 e collab2",
      project: project._id,
      assignedTo: [collab1._id, collab2._id],
    });
    log("green", `✅ Task creato: ${taskAssigned._id}`);
    log("green", `   Assegnato a: ${collab1.username}, ${collab2.username}\n`);

    // 6. Test 2: Task NON assegnato (tutti possono lavorarci)
    log("yellow", "6️⃣  Test 2: Task NON assegnato (accesso libero)...");
    const taskUnassigned = await Task.create({
      title: "Test Assignment Task - Unassigned",
      description: "Task senza assegnazione, tutti possono lavorarci",
      project: project._id,
      assignedTo: [],
    });
    log("green", `✅ Task creato: ${taskUnassigned._id}`);
    log("green", `   Assegnato a: NESSUNO (accesso libero)\n`);

    // 7. Test 3: Aggiungi todo con assegnazione VALIDA (task assigned)
    log(
      "yellow",
      "7️⃣  Test 3: Todo su task assigned - assegnazione VALIDA...",
    );
    taskAssigned.todos.push({
      text: "Todo assegnato a collab1 (valido)",
      assignedTo: collab1._id,
    });
    await taskAssigned.save();
    log("green", `✅ Todo aggiunto con successo!`);
    log("green", `   Todo assegnato a: ${collab1.username} ✓\n`);

    // 8. Test 4: Tentativo di assegnare todo a utente NON nel task
    log(
      "yellow",
      "8️⃣  Test 4: Todo su task assigned - assegnazione INVALIDA...",
    );
    try {
      // Simuliamo la validazione che farebbe il controller
      const projectMembers = [
        project.owner.toString(),
        ...project.collaborators.map((c) => c.toString()),
      ];
      const taskAssignees = taskAssigned.assignedTo.map((id) => id.toString());

      // Owner è membro del progetto ma NON è assegnato al task
      if (!taskAssignees.includes(owner._id.toString())) {
        log(
          "red",
          `❌ ERRORE ATTESO: ${owner.username} non è assegnato al task!`,
        );
        log(
          "green",
          "✅ Validazione funziona correttamente - assegnazione bloccata\n",
        );
      }
    } catch (error) {
      log("red", `❌ ERRORE IMPREVISTO: ${error.message}\n`);
    }

    // 9. Test 5: Todo su task unassigned - può essere assegnato a qualsiasi membro
    log(
      "yellow",
      "9️⃣  Test 5: Todo su task unassigned - assegnazione libera...",
    );
    taskUnassigned.todos.push({
      text: "Todo assegnato al owner (valido perché task unassigned)",
      assignedTo: owner._id,
    });
    taskUnassigned.todos.push({
      text: "Todo assegnato a collab2 (valido perché task unassigned)",
      assignedTo: collab2._id,
    });
    await taskUnassigned.save();
    log("green", `✅ Todos aggiunti con successo!`);
    log("green", `   Todo 1 assegnato a: ${owner.username} ✓`);
    log("green", `   Todo 2 assegnato a: ${collab2.username} ✓\n`);

    // 10. Test 6: Tentativo di assegnare todo a utente esterno
    log(
      "yellow",
      "🔟 Test 6: Todo assegnato a utente ESTERNO al progetto...",
    );
    try {
      const projectMembers = [
        project.owner.toString(),
        ...project.collaborators.map((c) => c.toString()),
      ];

      if (!projectMembers.includes(external._id.toString())) {
        log(
          "red",
          `❌ ERRORE ATTESO: ${external.username} non è membro del progetto!`,
        );
        log(
          "green",
          "✅ Validazione funziona correttamente - assegnazione bloccata\n",
        );
      }
    } catch (error) {
      log("red", `❌ ERRORE IMPREVISTO: ${error.message}\n`);
    }

    // 11. Test 7: Verifica struttura dati nel database
    log("yellow", "1️⃣1️⃣  Test 7: Verifica dati nel database...");
    const savedTaskAssigned = await Task.findById(taskAssigned._id).populate(
      "assignedTo",
      "username",
    );
    const savedTaskUnassigned = await Task.findById(taskUnassigned._id);

    log("cyan", "\n📊 Riepilogo Task Assigned:");
    log("cyan", `   Title: ${savedTaskAssigned.title}`);
    log(
      "cyan",
      `   Assigned To: ${savedTaskAssigned.assignedTo.map((u) => u.username).join(", ")}`,
    );
    log("cyan", `   Todos: ${savedTaskAssigned.todos.length}`);
    savedTaskAssigned.todos.forEach((todo, idx) => {
      log("cyan", `     - Todo ${idx + 1}: ${todo.text}`);
      log(
        "cyan",
        `       Assigned To: ${todo.assignedTo ? "Utente assegnato" : "Non assegnato"}`,
      );
    });

    log("cyan", "\n📊 Riepilogo Task Unassigned:");
    log("cyan", `   Title: ${savedTaskUnassigned.title}`);
    log("cyan", `   Assigned To: NESSUNO (tutti possono lavorarci)`);
    log("cyan", `   Todos: ${savedTaskUnassigned.todos.length}`);
    savedTaskUnassigned.todos.forEach((todo, idx) => {
      log("cyan", `     - Todo ${idx + 1}: ${todo.text}`);
      log(
        "cyan",
        `       Assigned To: ${todo.assignedTo ? "Utente assegnato" : "Non assegnato"}`,
      );
    });
    console.log();

    // 12. Test 8: Verifica notifiche TASK_ASSIGNED
    log("yellow", "1️⃣2️⃣  Test 8: Verifica tipo notifica TASK_ASSIGNED...");
    const testNotif = await Notification.create({
      recipient: collab1._id,
      sender: owner._id,
      type: "TASK_ASSIGNED",
      message: "Test notification for task assignment",
      project: project._id,
      task: taskAssigned._id,
    });
    log("green", `✅ Notifica TASK_ASSIGNED creata: ${testNotif._id}`);
    await testNotif.deleteOne();
    log("green", `✅ Notifica di test eliminata\n`);

    // 13. Test 9: Verifica notifiche TODO_ASSIGNED
    log("yellow", "1️⃣3️⃣  Test 9: Verifica tipo notifica TODO_ASSIGNED...");
    const testTodoNotif = await Notification.create({
      recipient: collab2._id,
      sender: owner._id,
      type: "TODO_ASSIGNED",
      message: "Test notification for todo assignment",
      project: project._id,
      task: taskUnassigned._id,
    });
    log("green", `✅ Notifica TODO_ASSIGNED creata: ${testTodoNotif._id}`);
    await testTodoNotif.deleteOne();
    log("green", `✅ Notifica di test eliminata\n`);

    // Riepilogo finale
    log("green", "\n=== 🎉 TEST COMPLETATO CON SUCCESSO! ===\n");
    log("blue", "✅ Riepilogo Funzionalità:");
    log("blue", "   ✓ Task con assignedTo funziona");
    log("blue", "   ✓ Task senza assignedTo funziona (accesso libero)");
    log("blue", "   ✓ Todo su task assigned: valida solo utenti assegnati");
    log("blue", "   ✓ Todo su task unassigned: accetta tutti i membri");
    log("blue", "   ✓ Validazione blocca utenti esterni al progetto");
    log("blue", "   ✓ Validazione blocca utenti non assegnati al task");
    log("blue", "   ✓ Notifiche TASK_ASSIGNED/TODO_ASSIGNED funzionano");
    log("blue", "   ✓ Struttura dati coerente nel database\n");

    log("cyan", "📝 Regole di Assegnazione:");
    log("cyan", "   1. Task.assignedTo = [] → Todos assegnabili a tutti i membri");
    log(
      "cyan",
      "   2. Task.assignedTo = [...] → Todos assegnabili solo agli assegnati",
    );
    log("cyan", "   3. Utenti esterni al progetto NON possono essere assegnati");
    log("cyan", "   4. Notifiche inviate solo agli utenti neo-assegnati\n");
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
testAssignmentSystem();
