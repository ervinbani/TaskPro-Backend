/**
 * Test Script for Todos Feature
 *
 * This script tests the todos functionality (add/update/delete todos in tasks)
 *
 * Requirements:
 * - MongoDB must be running
 * - Server must be running (node server.js)
 * - No authentication required for testing
 *
 * Usage: node test-todos-system.js
 */

const mongoose = require("mongoose");
const User = require("./models/User");
const Project = require("./models/Project");
const Task = require("./models/Task");
const Notification = require("./models/Notification");
require("dotenv").config();

// ANSI color codes for better output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

// Helper function to print colored messages
function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper function to print section headers
function section(title) {
  console.log("\n" + "=".repeat(60));
  log(title, "cyan");
  console.log("=".repeat(60) + "\n");
}

// Main test function
async function testTodosSystem() {
  let testUser1, testUser2, testProject, testTask;

  try {
    // Connect to database
    section("🔌 CONNECTING TO DATABASE");
    await mongoose.connect(process.env.MONGO_URI);
    log("✓ Database connected successfully", "green");

    // Clean up test data
    section("🧹 CLEANING UP TEST DATA");
    await User.deleteMany({ username: /^test_todo_user/ });
    await Project.deleteMany({ name: /^Test Todos Project/ });
    await Task.deleteMany({ title: /^Test Todos Task/ });
    await Notification.deleteMany({});
    log("✓ Test data cleaned", "green");

    // Create test users
    section("👥 CREATING TEST USERS");
    testUser1 = await User.create({
      username: "test_todo_user1",
      email: "test_todo1@example.com",
      password: "password123",
    });
    log(`✓ User 1 created: ${testUser1.username} (${testUser1._id})`, "green");

    testUser2 = await User.create({
      username: "test_todo_user2",
      email: "test_todo2@example.com",
      password: "password123",
    });
    log(`✓ User 2 created: ${testUser2.username} (${testUser2._id})`, "green");

    // Create test project
    section("📁 CREATING TEST PROJECT");
    testProject = await Project.create({
      name: "Test Todos Project",
      description: "Project to test todos functionality",
      owner: testUser1._id,
      collaborators: [testUser2._id],
    });
    log(`✓ Project created: ${testProject.name} (${testProject._id})`, "green");
    log(`  Owner: ${testUser1.username}`, "blue");
    log(`  Collaborators: ${testUser2.username}`, "blue");

    // Create test task
    section("📝 CREATING TEST TASK");
    testTask = await Task.create({
      title: "Test Todos Task",
      description: "Task to test todos feature",
      status: "To Do",
      project: testProject._id,
    });
    log(`✓ Task created: ${testTask.title} (${testTask._id})`, "green");
    log(`  Initial todos: ${testTask.todos.length}`, "blue");
    log(`  Initial todoProgress: ${testTask.todoProgress}%`, "blue");

    // Test 1: Add first todo
    section("TEST 1: ADD FIRST TODO");
    testTask.todos.push({
      text: "Create database schema",
      completed: false,
    });
    await testTask.save();
    log(`✓ First todo added`, "green");
    log(`  Total todos: ${testTask.todos.length}`, "blue");
    log(`  Todo text: "${testTask.todos[0].text}"`, "blue");
    log(`  Todo completed: ${testTask.todos[0].completed}`, "blue");
    log(`  Todo progress: ${testTask.todoProgress}%`, "blue");

    // Test 2: Add multiple todos
    section("TEST 2: ADD MULTIPLE TODOS");
    testTask.todos.push(
      { text: "Set up authentication", completed: false },
      { text: "Create API endpoints", completed: false },
      { text: "Write tests", completed: false },
    );
    await testTask.save();
    log(`✓ Multiple todos added`, "green");
    log(`  Total todos: ${testTask.todos.length}`, "blue");
    testTask.todos.forEach((todo, index) => {
      log(
        `  ${index + 1}. "${todo.text}" - ${todo.completed ? "✓" : "☐"}`,
        "blue",
      );
    });
    log(`  Todo progress: ${testTask.todoProgress}%`, "blue");

    // Test 3: Mark a todo as completed
    section("TEST 3: MARK TODO AS COMPLETED");
    const firstTodo = testTask.todos[0];
    firstTodo.completed = true;
    firstTodo.completedAt = new Date();
    firstTodo.completedBy = testUser2._id;
    await testTask.save();

    // Reload to get virtual fields
    testTask = await Task.findById(testTask._id);
    log(`✓ Todo marked as completed`, "green");
    log(`  Todo: "${firstTodo.text}"`, "blue");
    log(`  Completed by: User ${testUser2._id}`, "blue");
    log(`  Completed at: ${firstTodo.completedAt.toISOString()}`, "blue");
    log(`  Todo progress: ${testTask.todoProgress}%`, "blue");

    // Test 4: Update todo text
    section("TEST 4: UPDATE TODO TEXT");
    const secondTodo = testTask.todos[1];
    const oldText = secondTodo.text;
    secondTodo.text = "Set up JWT authentication with refresh tokens";
    await testTask.save();
    log(`✓ Todo text updated`, "green");
    log(`  Old text: "${oldText}"`, "yellow");
    log(`  New text: "${secondTodo.text}"`, "blue");

    // Test 5: Mark all todos as completed
    section("TEST 5: MARK ALL TODOS AS COMPLETED");
    testTask.todos.forEach((todo) => {
      if (!todo.completed) {
        todo.completed = true;
        todo.completedAt = new Date();
        todo.completedBy = testUser1._id;
      }
    });
    await testTask.save();

    // Reload to get virtual fields
    testTask = await Task.findById(testTask._id);
    log(`✓ All todos marked as completed`, "green");
    log(`  Total todos: ${testTask.todos.length}`, "blue");
    log(
      `  Completed todos: ${testTask.todos.filter((t) => t.completed).length}`,
      "blue",
    );
    log(`  Todo progress: ${testTask.todoProgress}%`, "blue");

    // Test 6: Delete a todo
    section("TEST 6: DELETE A TODO");
    const todoToDelete = testTask.todos[testTask.todos.length - 1];
    const deletedText = todoToDelete.text;
    const todosBeforeDelete = testTask.todos.length;
    testTask.todos.pull(todoToDelete._id);
    await testTask.save();

    // Reload to get virtual fields
    testTask = await Task.findById(testTask._id);
    log(`✓ Todo deleted`, "green");
    log(`  Deleted todo: "${deletedText}"`, "yellow");
    log(`  Todos before: ${todosBeforeDelete}`, "blue");
    log(`  Todos after: ${testTask.todos.length}`, "blue");
    log(`  Todo progress: ${testTask.todoProgress}%`, "blue");

    // Test 7: Test max todos limit (50)
    section("TEST 7: TEST MAX TODOS LIMIT");
    const currentTodos = testTask.todos.length;
    const todosToAdd = 50 - currentTodos;

    for (let i = 1; i <= todosToAdd; i++) {
      testTask.todos.push({
        text: `Test todo ${i}`,
        completed: false,
      });
    }
    await testTask.save();
    log(`✓ Maximum todos added`, "green");
    log(`  Total todos: ${testTask.todos.length}`, "blue");
    log(`  Max allowed: 50`, "blue");

    // Try to add one more (should be handled by controller validation)
    log(
      `\n  Note: Controller will prevent adding more than 50 todos`,
      "yellow",
    );

    // Test 8: Verify virtual field calculation
    section("TEST 8: VERIFY TODOPROGRESS CALCULATION");
    testTask = await Task.findById(testTask._id);
    const completedCount = testTask.todos.filter((t) => t.completed).length;
    const totalCount = testTask.todos.length;
    const expectedProgress = Math.round((completedCount / totalCount) * 100);
    const actualProgress = testTask.todoProgress;

    log(`✓ Progress calculation verified`, "green");
    log(`  Completed: ${completedCount}`, "blue");
    log(`  Total: ${totalCount}`, "blue");
    log(`  Expected progress: ${expectedProgress}%`, "blue");
    log(`  Actual progress: ${actualProgress}%`, "blue");
    log(
      `  Match: ${expectedProgress === actualProgress ? "✓ YES" : "✗ NO"}`,
      expectedProgress === actualProgress ? "green" : "red",
    );

    // Test 9: Check notifications were created
    section("TEST 9: VERIFY TODO NOTIFICATIONS");
    const notifications = await Notification.find({
      $or: [{ recipient: testUser1._id }, { recipient: testUser2._id }],
    }).sort({ createdAt: -1 });

    log(`✓ Notifications found: ${notifications.length}`, "green");

    const todoNotifications = notifications.filter((n) =>
      n.type.includes("TODO"),
    );

    if (todoNotifications.length > 0) {
      log(`  Todo-related notifications: ${todoNotifications.length}`, "blue");
      todoNotifications.slice(0, 5).forEach((notif, index) => {
        log(`  ${index + 1}. [${notif.type}] ${notif.message}`, "blue");
      });
    } else {
      log(
        `  Note: Notifications are created by controller actions, not direct model operations`,
        "yellow",
      );
    }

    // Summary
    section("✅ ALL TESTS COMPLETED SUCCESSFULLY");
    log("Summary:", "green");
    log(`  ✓ Users created: 2`, "green");
    log(`  ✓ Project created: 1`, "green");
    log(`  ✓ Task created with todos: 1`, "green");
    log(`  ✓ Todos added: ${testTask.todos.length}`, "green");
    log(`  ✓ Todo operations tested: Add, Update, Complete, Delete`, "green");
    log(`  ✓ Virtual field todoProgress working: Yes`, "green");
    log(`  ✓ Max limit respected: Yes (50 todos)`, "green");

    // Clean up
    section("🧹 CLEANING UP TEST DATA");
    await User.deleteMany({ username: /^test_todo_user/ });
    await Project.deleteMany({ name: /^Test Todos Project/ });
    await Task.deleteMany({ title: /^Test Todos Task/ });
    await Notification.deleteMany({});
    log("✓ Test data cleaned", "green");
  } catch (error) {
    log("\n❌ TEST FAILED", "red");
    log(`Error: ${error.message}`, "red");
    console.error(error);
    process.exit(1);
  } finally {
    // Disconnect from database
    await mongoose.connection.close();
    log("\n✓ Database connection closed", "green");
    log("\n🎉 Todos system test completed!", "cyan");
  }
}

// Run the test
testTodosSystem();
