// Fixed and improved index.js

let todoItems = [];
let doneItems = [];

const todoListDiv = document.getElementById("todoList");
const doneListDiv = document.getElementById("doneList");
const input = document.getElementById("itemInput");
const darkToggle = document.getElementById("darkToggle");

const storageKeyTodo = "todoItemsDaily";
const storageKeyDone = "doneItemsDaily";

// Dark Mode
if (localStorage.getItem("darkMode") === "on") {
  document.body.classList.add("dark");
  darkToggle.checked = true;
}

darkToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark", darkToggle.checked);
  localStorage.setItem("darkMode", darkToggle.checked ? "on" : "off");
});

// Render Items
function renderItems() {
  renderList(todoListDiv, todoItems, "todo");
  renderList(doneListDiv, doneItems, "done");
  updateProgressBar(); // this one updates UI and saves to localStorage
}


function updateProgressBar() {
  const total = todoItems.length + doneItems.length;
  const percent = total ? (doneItems.length / total) * 100 : 0;

  document.getElementById("progress-fill").style.width = `${percent}%`;

  // Save to localStorage for the welcome page to use
  localStorage.setItem("dailyProgress", percent.toFixed(0));
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
editBtn.onclick = () => openEditModal(index, type);




    actions.appendChild(editBtn);
    actions.appendChild(actionBtn);
    actions.appendChild(deleteBtn);

    div.appendChild(text);
    div.appendChild(actions);

    // Swipe-to-delete (mobile)
let touchStartX = 0;
let touchEndX = 0;

div.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

div.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  const swipeDistance = touchStartX - touchEndX;
  if (swipeDistance > 100) { // Swiped left
    if (confirm("Swipe detected. Delete this task?")) {
      deleteItem(index, type);
    }
  }
}


    container.appendChild(div);
  });

}

// Drag & Drop Logic
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

// Add Item with Due Date & Priority
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

function deleteDoneItem(index) {
  if (confirm("Are you sure you want to delete this item?")) {
    doneItems.splice(index, 1);
    renderItems();
    saveItems();
  }
}

function deleteItem(index, type) {
  if (confirm("Are you sure you want to delete this task?")) {
    if (type === "done") doneItems.splice(index, 1);
    else todoItems.splice(index, 1);
    renderItems();
    saveItems();
  }
}


let editIndex = null;
let editType = null;

function openEditModal(index, type) {
  editIndex = index;
  editType = type;

  const item = type === "todo" ? todoItems[index] : doneItems[index];
  document.getElementById("editText").value = item.text;
  document.getElementById("editDate").value = item.due;
  document.getElementById("editPriority").value = item.priority;

  document.getElementById("editDate").setAttribute("min", new Date().toISOString().split("T")[0]);

  document.getElementById("editModal").style.display = "flex";
}

function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
}

function saveEdit() {
  const newText = document.getElementById("editText").value.trim();
  const newDate = document.getElementById("editDate").value;
  const newPriority = document.getElementById("editPriority").value;

  if (!newText) {
    alert("Task cannot be empty");
    return;

    
  }

  const list = editType === "todo" ? todoItems : doneItems;
  list[editIndex].text = newText;
  list[editIndex].due = newDate || "None";
  list[editIndex].priority = newPriority;

  closeEditModal();
  renderItems();
  saveItems();
}

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