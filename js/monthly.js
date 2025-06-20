let todoItems = [];
let doneItems = [];

const todoListDiv = document.getElementById("todoList");
const doneListDiv = document.getElementById("doneList");
const input = document.getElementById("itemInput");
const darkToggle = document.getElementById("darkToggle");

const storageKeyTodo = "todoItemsMonthly";
const storageKeyDone = "doneItemsMonthly";

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
  updateProgressBar();
}

function updateProgressBar() {
  const total = todoItems.length + doneItems.length;
  const percent = total ? (doneItems.length / total) * 100 : 0;
  document.getElementById("progress-fill").style.width = `${percent}%`;
  localStorage.setItem("monthlyProgress", percent.toFixed(0));
}

function renderList(container, list, type) {
  container.innerHTML = "";

  list.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "item";
    div.setAttribute("draggable", true);
    div.dataset.index = index;
    div.dataset.type = type;

    div.classList.add(`priority-${item.priority.toLowerCase()}`);

    div.addEventListener("dragstart", handleDragStart);
    div.addEventListener("dragover", handleDragOver);
    div.addEventListener("drop", handleDrop);
    div.addEventListener("dragenter", () => div.classList.add("drag-over"));
    div.addEventListener("dragleave", () => div.classList.remove("drag-over"));

    const text = document.createElement("div");
    const dueDate = new Date(item.due);
    const now = new Date();

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
    actionBtn.onclick = () => type === "todo" ? markAsDone(index) : moveToTodo(index);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "🗑️ Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.title = "Delete this task";
    deleteBtn.onclick = () => deleteItem(index, type);

    const editBtn = document.createElement("button");
    editBtn.innerHTML = "✏️";
    editBtn.title = "Edit task";
    editBtn.className = "edit-btn";
    editBtn.onclick = () => openEditModal(index, type);

    actions.appendChild(editBtn);
    actions.appendChild(actionBtn);
    actions.appendChild(deleteBtn);

    div.appendChild(text);
    div.appendChild(actions);

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
  // proceed with deletion
    if (type === "done") doneItems.splice(index, 1);
  else todoItems.splice(index, 1);
  renderItems();
  saveItems();
}


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

  document.getElementById("editText").value = item.text;
  document.getElementById("editDate").value = item.due;
  document.getElementById("editPriority").value = item.priority;

  document.getElementById("editDate").setAttribute("min", new Date().toISOString().split("T")[0]);

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

  document.getElementById("editModal").style.display = "none";
  renderItems();
  saveItems();
});

document.getElementById("cancelEdit").addEventListener("click", () => {
  document.getElementById("editModal").style.display = "none";
});


document.addEventListener("DOMContentLoaded", loadItems);

document.addEventListener("DOMContentLoaded", () => {
  loadItems();

  const today = new Date().toISOString().split("T")[0];
  document.getElementById("dueDateInput").setAttribute("min", today);
});


