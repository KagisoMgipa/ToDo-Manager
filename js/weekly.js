let todoItems = [];
let doneItems = [];

const todoListDiv = document.getElementById("todoList");
const doneListDiv = document.getElementById("doneList");
const input = document.getElementById("itemInput");
const darkToggle = document.getElementById("darkToggle");

const storageKeyTodo = "todoItemsWeekly";
const storageKeyDone = "doneItemsWeekly";

// Dark Mode
darkToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark", darkToggle.checked);
  localStorage.setItem("darkMode", darkToggle.checked ? "on" : "off");
});

if (localStorage.getItem("darkMode") === "on") {
  document.body.classList.add("dark");
  darkToggle.checked = true;
}

function renderItems() {
  renderList(todoListDiv, todoItems, "todo");
  renderList(doneListDiv, doneItems, "done");
  updateProgressBar(); // handles both visual and localStorage update
}


function updateProgressBar() {
  const total = todoItems.length + doneItems.length;
  const percent = total ? (doneItems.length / total) * 100 : 0;

  document.getElementById("progress-fill").style.width = `${percent}%`;

  // Save to localStorage so index.html can show progress
  localStorage.setItem("weeklyProgress", percent.toFixed(0));
}



function renderList(container, list, type) {
  container.innerHTML = "";

  list.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "item";
    div.setAttribute("draggable", true);
    div.dataset.index = index;
    div.dataset.type = type;

    // Priority styling
    div.classList.add(`priority-${item.priority.toLowerCase()}`);

    // Drag events
    div.addEventListener("dragstart", handleDragStart);
    div.addEventListener("dragover", handleDragOver);
    div.addEventListener("drop", handleDrop);
    div.addEventListener("dragenter", () => div.classList.add("drag-over"));
    div.addEventListener("dragleave", () => div.classList.remove("drag-over"));

    const text = document.createElement("div");

    const dueDate = new Date(item.due);
    const now = new Date();

    // Priority icon
    let priorityIcon = item.priority === "High" ? "🔥" : item.priority === "Medium" ? "⚠️" : "✅";
    const taskTitle = document.createElement("div");
    taskTitle.textContent = `${priorityIcon} ${item.text}`;

    const dueInfo = document.createElement("div");
    dueInfo.textContent = `📅 ${dueDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    })}`;
    dueInfo.className = "due-date";

    // Highlight overdue or due soon
    if (item.due !== "None") {
      const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      if (daysLeft < 0) dueInfo.classList.add("overdue");
      else if (daysLeft <= 2) div.classList.add("due-soon");
    }

    text.appendChild(taskTitle);
    text.appendChild(dueInfo);

    const actions = document.createElement("div");
    actions.className = "item-actions";

    const actionBtn = document.createElement("button");
    actionBtn.innerHTML = type === "todo" ? "✅ Done" : "↩️ Undo";
    actionBtn.title = type === "todo" ? "Mark task as done" : "Move task back to To Do";
    actionBtn.onclick = () =>
      type === "todo" ? markAsDone(index) : moveToTodo(index);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "🗑️ Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.title = "Delete this task";
    deleteBtn.onclick = () => deleteItem(index, type);
    const editBtn = document.createElement("button");
    editBtn.innerHTML = "✏️";
    editBtn.title = "Edit task";
    editBtn.className = "edit-btn";
    editBtn.onclick = () => openEditModal(index, type); // ✅ this is correct

    actions.appendChild(editBtn);
    actions.appendChild(actionBtn);
    actions.appendChild(deleteBtn);

    div.appendChild(text);
    div.appendChild(actions);

    // Mobile swipe-to-delete support
    let touchStartX = 0;
    let touchEndX = 0;

    div.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    div.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 100) {
        if (confirm("Swipe detected. Delete this task?")) {
          deleteItem(index, type);
        }
      }
    });

    container.appendChild(div);
  });
}



let dragSrcIndex = null;
let dragSrcType = null;

function handleDragStart(e) {
  dragSrcIndex = +this.dataset.index;
  dragSrcType = this.dataset.type;
  e.dataTransfer.effectAllowed = "move";
}

function handleDragOver(e) {
  e.preventDefault();
}

function handleDrop(e) {
  e.preventDefault();
  const targetIndex = +this.dataset.index;
  const targetType = this.dataset.type;

  if (dragSrcType !== targetType) return;

  const list = targetType === "todo" ? todoItems : doneItems;
  const item = list.splice(dragSrcIndex, 1)[0];
  list.splice(targetIndex, 0, item);

  renderItems();
  saveItems();
}

function addItem() {
  const value = input.value.trim();
  const dueInput = document.getElementById("dueDateInput");
  const prioritySelect = document.getElementById("prioritySelect");

  const due = dueInput.value || "None";
  const priority = prioritySelect.value;

  if (!value) {
    alert("You cannot add an empty item");
    return;
  }

  todoItems.push({ text: value, due: due, priority: priority });
  input.value = "";
  dueInput.value = "";
  prioritySelect.value = "Medium";
  renderItems();
  saveItems();
}

function markAsDone(index) {
  const item = todoItems.splice(index, 1)[0];
  doneItems.push(item);
  renderItems();
  saveItems();
}

function moveToTodo(index) {
  const item = doneItems.splice(index, 1)[0];
  todoItems.push(item);
  renderItems();
  saveItems();
}

function deleteItem(index, type) {
  if (confirm("Are you sure you want to delete this task?")) {
    if (type === "done") doneItems.splice(index, 1);
    else todoItems.splice(index, 1);
    renderItems();
    saveItems();
  }
}

function editItem(index, type) {
  const list = type === "todo" ? todoItems : doneItems;
  const item = list[index];

  const newText = prompt("Edit task title:", item.text);
  if (newText === null) return;

  const newDate = prompt("Edit due date (YYYY-MM-DD):", item.due);
  if (newDate === null) return;

  const newPriority = prompt("Edit priority (Low, Medium, High):", item.priority);
  if (newPriority === null) return;

  item.text = newText.trim() || item.text;
  item.due = newDate || item.due;
  item.priority = ["Low", "Medium", "High"].includes(newPriority) ? newPriority : item.priority;

  renderItems();
  saveItems();
}


function saveItems() {
  localStorage.setItem(storageKeyTodo, JSON.stringify(todoItems));
  localStorage.setItem(storageKeyDone, JSON.stringify(doneItems));
}

function loadItems() {
  const savedTodo = localStorage.getItem(storageKeyTodo);
  const savedDone = localStorage.getItem(storageKeyDone);

  if (savedTodo) todoItems = JSON.parse(savedTodo);
  if (savedDone) doneItems = JSON.parse(savedDone);

  renderItems();
}

let editingIndex = null;
let editingType = null;

function openEditModal(index, type) {
  editingIndex = index;
  editingType = type;

  const list = type === "todo" ? todoItems : doneItems;
  const item = list[index];

  // Fill modal inputs
  document.getElementById("editText").value = item.text || "";
  document.getElementById("editDate").value = item.due || "";
  document.getElementById("editPriority").value = item.priority || "Medium";

  document.getElementById("editDate").setAttribute("min", new Date().toISOString().split("T")[0]);

  // Show modal
  document.getElementById("editModal").style.display = "block";
}


document.getElementById("saveEdit").addEventListener("click", () => {
  const text = document.getElementById("editText").value.trim();
  const date = document.getElementById("editDate").value;
  const priority = document.getElementById("editPriority").value;

  if (editingType === "todo") {
    todoItems[editingIndex] = { ...todoItems[editingIndex], text, due: date, priority };
  } else {
    doneItems[editingIndex] = { ...doneItems[editingIndex], text, due: date, priority };
  }

  closeEditModal();
  renderItems();
  saveItems();
});

document.getElementById("cancelEdit").addEventListener("click", closeEditModal);

function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
  editingIndex = null;
  editingType = null;

  // Optional: Clear modal fields
  document.getElementById("editText").value = "";
  document.getElementById("editDate").value = "";
  document.getElementById("editPriority").value = "Medium";
}


document.getElementById("cancelEdit").addEventListener("click", () => {
  document.getElementById("editModal").style.display = "none";
});

function resetAll() {
  if (confirm("Are you sure you want to delete ALL tasks?")) {
    todoItems = [];
    doneItems = [];
    saveItems();
    renderItems();
  }
}
document.addEventListener("DOMContentLoaded", () => {
  loadItems();

  const today = new Date().toISOString().split("T")[0];
  document.getElementById("dueDateInput").setAttribute("min", today);
});



document.addEventListener("DOMContentLoaded", loadItems);
