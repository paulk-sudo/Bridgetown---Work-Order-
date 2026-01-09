document.addEventListener("DOMContentLoaded", () => {
  
  const DEFAULT_PART_ROWS = 6;

// ---------- Parts UI ----------
function makePartsRow() {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="number" min="0" step="1" class="part-qty" inputmode="numeric"></td>
    <td><input type="text" class="part-desc" placeholder=""></td>
    <td><input type="text" class="part-cat" placeholder=""></td>
  `;
  return tr;
}

function initPartsTables(rows = DEFAULT_PART_ROWS) {
  const leftBody = document.querySelector("#partsLeft tbody");
  const rightBody = document.querySelector("#partsRight tbody");
  leftBody.innerHTML = "";
  rightBody.innerHTML = "";

  const leftRows = Math.ceil(rows / 2);
  const rightRows = rows - leftRows;

  for (let i = 0; i < leftRows; i++) leftBody.appendChild(makePartsRow());
  for (let i = 0; i < rightRows; i++) rightBody.appendChild(makePartsRow());
}

function addPartsRow() {
  const leftBody = document.querySelector("#partsLeft tbody");
  const rightBody = document.querySelector("#partsRight tbody");

  if (leftBody.children.length <= rightBody.children.length) {
    leftBody.appendChild(makePartsRow());
  } else {
    rightBody.appendChild(makePartsRow());
  }
}

function clearParts() {
  document.querySelectorAll(".parts-table input").forEach((inp) => (inp.value = ""));
}

function getPartsData() {
  const rows = [];
  document.querySelectorAll("#partsLeft tbody tr, #partsRight tbody tr").forEach((tr) => {
    const qty = tr.querySelector(".part-qty").value.trim();
    const desc = tr.querySelector(".part-desc").value.trim();
    const cat = tr.querySelector(".part-cat").value.trim();
    if (qty || desc || cat) rows.push({ qty, desc, cat });
  });
  return rows;
}

function setPartsData(partsArray) {
  initPartsTables(Math.max(DEFAULT_PART_ROWS, partsArray.length));
  const allRows = Array.from(document.querySelectorAll("#partsLeft tbody tr, #partsRight tbody tr"));
  partsArray.forEach((p, idx) => {
    const tr = allRows[idx];
    tr.querySelector(".part-qty").value = p.qty ?? "";
    tr.querySelector(".part-desc").value = p.desc ?? "";
    tr.querySelector(".part-cat").value = p.cat ?? "";
  });
}

// ---------- Work order data ----------
function formToData() {
  return {
    customer: document.getElementById("customer").value,
    date: document.getElementById("date").value,
    ymm: document.getElementById("ymm").value,
    unitNo: document.getElementById("unitNo").value,
    vin: document.getElementById("vin").value,
    po: document.getElementById("po").value,
    mechanic: document.getElementById("mechanic").value,
    mileage: document.getElementById("mileage").value,
    workDesc: document.getElementById("workDesc").value,
    notes: document.getElementById("notes").value,
    total: document.getElementById("total").value,
    parts: getPartsData(),
  };
}

function dataToForm(data) {
  document.getElementById("customer").value = data.customer || "";
  document.getElementById("date").value = data.date || "";
  document.getElementById("ymm").value = data.ymm || "";
  document.getElementById("unitNo").value = data.unitNo || "";
  document.getElementById("vin").value = data.vin || "";
  document.getElementById("po").value = data.po || "";
  document.getElementById("mechanic").value = data.mechanic || "";
  document.getElementById("mileage").value = data.mileage || "";
  document.getElementById("workDesc").value = data.workDesc || "";
  document.getElementById("notes").value = data.notes || "";
  document.getElementById("total").value = data.total || "";
  setPartsData(data.parts || []);
}

// ---------- API ----------
async function api(path, opts) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function refreshWorkOrderList() {
  const select = document.getElementById("loadSelect");
  const list = await api("/api/workorders");
  select.innerHTML = "";
  list.forEach((wo) => {
    const opt = document.createElement("option");
    opt.value = wo.id;
    opt.textContent = `${wo.id} — ${wo.customer || "No customer"} (${wo.date || "No date"})`;
    select.appendChild(opt);
  });
}

// ---------- Buttons ----------
async function onNew() {
  dataToForm({});
}

async function onSave() {
  const data = formToData();
  const id = prompt("Work Order ID (example: WO-1005)", data.id || "");
  if (!id) return;
  data.id = id;
  await api("/api/workorders", { method: "POST", body: JSON.stringify(data) });
  await refreshWorkOrderList();
  alert("Saved!");
}

async function onLoad() {
  const id = document.getElementById("loadSelect").value;
  if (!id) return;
  const data = await api(`/api/workorders/${encodeURIComponent(id)}`);
  dataToForm(data);
}

async function onDelete() {
  const id = document.getElementById("loadSelect").value;
  if (!id) return;
  if (!confirm(`Delete ${id}?`)) return;
  await api(`/api/workorders/${encodeURIComponent(id)}`, { method: "DELETE" });
  await refreshWorkOrderList();
  alert("Deleted.");
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", async () => {
  initPartsTables(DEFAULT_PART_ROWS);

  document.getElementById("addPartRowBtn").addEventListener("click", addPartsRow);
  document.getElementById("clearPartsBtn").addEventListener("click", clearParts);

  document.getElementById("newBtn").addEventListener("click", onNew);
  document.getElementById("saveBtn").addEventListener("click", onSave);
  document.getElementById("loadBtn").addEventListener("click", onLoad);
  document.getElementById("deleteBtn").addEventListener("click", onDelete);

  await refreshWorkOrderList();
});
