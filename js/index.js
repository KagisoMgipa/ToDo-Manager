    // Temporary mock progress values – replace with localStorage values later
  const darkToggle = document.getElementById("darkToggle");

  // Load dark mode from localStorage
  if (localStorage.getItem("darkMode") === "on") {
    document.body.classList.add("dark");
    if (darkToggle) darkToggle.checked = true;
  }

  // Toggle dark mode
  if (darkToggle) {
    darkToggle.addEventListener("change", () => {
      document.body.classList.toggle("dark", darkToggle.checked);
      localStorage.setItem("darkMode", darkToggle.checked ? "on" : "off");
    });
  }

function loadProgressBars() {
  const daily = JSON.parse(localStorage.getItem("todoItemsDaily") || "[]");
  const doneDaily = JSON.parse(localStorage.getItem("doneItemsDaily") || "[]");

  const weekly = JSON.parse(localStorage.getItem("todoItemsWeekly") || "[]");
  const doneWeekly = JSON.parse(localStorage.getItem("doneItemsWeekly") || "[]");

  const monthly = JSON.parse(localStorage.getItem("todoItemsMonthly") || "[]");
  const doneMonthly = JSON.parse(localStorage.getItem("doneItemsMonthly") || "[]");

  const setProgress = (done, total, elementId) => {
    const totalTasks = done.length + total.length;
    const percent = totalTasks ? (done.length / totalTasks) * 100 : 0;
    document.getElementById(elementId).style.width = `${percent}%`;
    document.getElementById(elementId).textContent = `${percent.toFixed(0)}%`;
  };

  setProgress(doneDaily, daily, "daily-progress");
  setProgress(doneWeekly, weekly, "weekly-progress");
  setProgress(doneMonthly, monthly, "monthly-progress");
}

function updateBadgeCount() {
  const badge = document.getElementById("daily-badge");
  if (!badge) return;

  const dailyTasks = JSON.parse(localStorage.getItem("todoItemsDaily") || "[]");
  const now = new Date();
  let count = 0;

  dailyTasks.forEach(item => {
    if (item.due !== "None") {
      const dueDate = new Date(item.due);
      const diff = dueDate.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
      if (diff <= 0) count++;
    }
  });

  if (count > 0) {
    badge.textContent = count;
    badge.style.display = "inline-block";
  } else {
    badge.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadProgressBars();
  updateBadgeCount();
  updateWeeklyBadgeCount();
  updateMonthlyBadgeCount();
  
});

function updateWeeklyBadgeCount() {
  const badge = document.getElementById("weekly-badge");
  if (!badge) return;

  const weeklyTasks = JSON.parse(localStorage.getItem("todoItemsWeekly") || "[]");
  const now = new Date();
  let count = 0;

  weeklyTasks.forEach(item => {
    if (item.due !== "None") {
      const dueDate = new Date(item.due);
      const diff = dueDate.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
      if (diff <= 0) count++;
    }
  });

  if (count > 0) {
    badge.textContent = count;
    badge.style.display = "inline-block";
  } else {
    badge.style.display = "none";
  }
}

function updateMonthlyBadgeCount() {
  const monthlyTodo = JSON.parse(localStorage.getItem("todoItemsMonthly") || "[]");
  const monthlyDone = JSON.parse(localStorage.getItem("doneItemsMonthly") || "[]");

  const now = new Date();
  const dueSoon = monthlyTodo.filter(item => {
    if (!item.due || item.due === "None") return false;
    const dueDate = new Date(item.due);
    const daysDiff = (dueDate - now) / (1000 * 60 * 60 * 24);
    return daysDiff <= 3 && daysDiff >= 0;
  });

  const overdue = monthlyTodo.filter(item => {
    if (!item.due || item.due === "None") return false;
    const dueDate = new Date(item.due);
    return dueDate < now;
  });

  const count = dueSoon.length + overdue.length;
  const badge = document.getElementById("monthly-badge");

  if (count > 0) {
    badge.textContent = count;
    badge.style.display = "inline-block";
  } else {
    badge.style.display = "none";
  }
}


/*function checkDueTasks() {
  const now = new Date();
  let dueToday = [];
  let overdue = [];

  todoItems.forEach((item) => {
    const dueDate = new Date(item.due);
    if (item.due !== "None") {
      const diff = dueDate.setHours(0,0,0,0) - now.setHours(0,0,0,0);
      if (diff === 0) dueToday.push(item.text);
      else if (diff < 0) overdue.push(item.text);
    }
  });

  if (dueToday.length > 0 || overdue.length > 0) {
    let message = "";
    if (dueToday.length > 0) {
      message += `🟡 Tasks due today:\n${dueToday.join("\n")}\n\n`;
    }
    if (overdue.length > 0) {
      message += `🔴 Overdue tasks:\n${overdue.join("\n")}`;
    }
    alert(message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadItems();
  checkDueTasks();
});

function updateBadgeCount() {
  const badge = document.getElementById("daily-badge"); // change per page
  let count = 0;

  const now = new Date();
  todoItems.forEach(item => {
    if (item.due !== "None") {
      const dueDate = new Date(item.due);
      const diff = dueDate.setHours(0,0,0,0) - now.setHours(0,0,0,0);
      if (diff === 0 || diff < 0) count++;
    }
  });

  if (count > 0) {
    badge.textContent = count;
    badge.style.display = "inline-block";
  } else {
    badge.style.display = "none";
  } 


}*/