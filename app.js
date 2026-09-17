/* =========================================================
   HISAB — Money Manager
   Personal • Business • Goals • Paisa Len-Den
   Offline / Local Storage V1
========================================================= */

const HISAB_KEY = "hisab_money_manager_v1";

const defaultData = {
  mode: "Personal",
  transactions: [],
  lendings: [],
  goals: [],
  budgets: [],
  bills: [],
  loans: [],
  settings: {
    currency: "₹",
    language: "English"
  }
};

let data = loadData();

function loadData() {
  try {
    const saved = localStorage.getItem(HISAB_KEY);

    if (!saved) {
      return structuredClone(defaultData);
    }

    const parsed = JSON.parse(saved);

    return {
      ...structuredClone(defaultData),
      ...parsed,
      settings: {
        ...structuredClone(defaultData.settings),
        ...(parsed.settings || {})
      }
    };
  } catch (e) {
    return structuredClone(defaultData);
  }
}

function saveData() {
  localStorage.setItem(
    HISAB_KEY,
    JSON.stringify(data)
  );

  updateDashboard();
}

/* =========================================================
   HELPERS
========================================================= */

function money(amount) {
  return `${data.settings.currency}${Number(
    amount || 0
  ).toLocaleString("en-IN")}`;
}

function today() {
  return new Date()
    .toISOString()
    .split("T")[0];
}

function id() {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2)
  );
}

function getEl(elementId) {
  return document.getElementById(elementId);
}

function safeText(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setText(elementId, value) {
  const element = getEl(elementId);

  if (element) {
    element.textContent = value;
  }
}

/* =========================================================
   GUEST MODE + SCREEN NAVIGATION
========================================================= */

function enterGuestMode() {
  const guestGate = getEl("guestGate");
  const appShell = getEl("appShell");

  if (guestGate) {
    guestGate.classList.add("hidden");
  }

  if (appShell) {
    appShell.classList.remove("hidden");
  }

  localStorage.setItem(
    "hisab_guest_mode",
    "true"
  );

  renderAll();

  show("home");

  showToast("Welcome to HISAB");
}

function show(sectionId) {
  const appShell = getEl("appShell");

  if (appShell) {
    appShell.classList.remove("hidden");
  }

  document
    .querySelectorAll(".screen")
    .forEach(section => {
      section.classList.add("hidden");
    });

  const target = getEl(sectionId);

  if (target) {
    target.classList.remove("hidden");

    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

function restoreGuestMode() {
  const guestGate = getEl("guestGate");
  const appShell = getEl("appShell");

  if (
    localStorage.getItem(
      "hisab_guest_mode"
    ) === "true"
  ) {
    if (guestGate) {
      guestGate.classList.add("hidden");
    }

    if (appShell) {
      appShell.classList.remove("hidden");
    }
  }
}

window.enterGuestMode = enterGuestMode;
window.show = show;

/* =========================================================
   MODE
========================================================= */

function setMode(mode) {
  data.mode = mode;

  saveData();

  document
    .querySelectorAll(".mode-btn")
    .forEach(btn => {
      btn.classList.toggle(
        "active",
        btn.dataset.mode === mode
      );
    });

  showToast(
    `${mode} mode selected`
  );
}

window.setMode = setMode;

/* =========================================================
   TRANSACTIONS
========================================================= */

function addTransaction(
  type,
  amount,
  note = "",
  date = today()
) {
  amount = Number(amount);

  if (!amount || amount <= 0) {
    showToast(
      "Enter a valid amount"
    );

    return false;
  }

  data.transactions.push({
    id: id(),
    type,
    amount,
    note,
    date,
    mode: data.mode,
    createdAt: new Date().toISOString()
  });

  saveData();

  return true;
}

function addIncome(
  amount,
  note,
  date
) {
  if (
    addTransaction(
      "income",
      amount,
      note,
      date
    )
  ) {
    showToast("Income added");
    renderTransactions();
  }
}

function addExpense(
  amount,
  note,
  date
) {
  if (
    addTransaction(
      "expense",
      amount,
      note,
      date
    )
  ) {
    showToast("Expense added");
    renderTransactions();
  }
}

function deleteTransaction(
  transactionId
) {
  data.transactions =
    data.transactions.filter(
      item =>
        item.id !== transactionId
    );

  saveData();

  renderTransactions();

  showToast(
    "Transaction deleted"
  );
}

window.addIncome = addIncome;
window.addExpense = addExpense;
window.deleteTransaction =
  deleteTransaction;

/* =========================================================
   PAISA LEN-DEN
========================================================= */

function addLending(
  type,
  person,
  amount,
  note = "",
  dueDate = ""
) {
  amount = Number(amount);

  if (
    !String(person || "").trim()
  ) {
    showToast(
      "Enter person's name"
    );

    return false;
  }

  if (!amount || amount <= 0) {
    showToast(
      "Enter a valid amount"
    );

    return false;
  }

  data.lendings.push({
    id: id(),
    type,
    person: String(person).trim(),
    amount,
    note,
    dueDate,
    date: today(),
    mode: data.mode,
    status: "pending"
  });

  saveData();

  renderLendings();

  showToast(
    type === "given"
      ? "Money Given added"
      : "Money Received added"
  );

  return true;
}

function markLendingPaid(
  lendingId
) {
  const item =
    data.lendings.find(
      x => x.id === lendingId
    );

  if (!item) return;

  item.status =
    item.status === "paid"
      ? "pending"
      : "paid";

  saveData();

  renderLendings();
}

function deleteLending(
  lendingId
) {
  data.lendings =
    data.lendings.filter(
      item =>
        item.id !== lendingId
    );

  saveData();

  renderLendings();

  showToast(
    "Paisa Len-Den deleted"
  );
}

window.addLending =
  addLending;

window.markLendingPaid =
  markLendingPaid;

window.deleteLending =
  deleteLending;

/* =========================================================
   GOALS
========================================================= */

function addGoal(
  name,
  target,
  saved = 0,
  deadline = ""
) {
  target = Number(target);
  saved = Number(saved || 0);

  if (
    !String(name || "").trim() ||
    target <= 0
  ) {
    showToast(
      "Enter goal name and target"
    );

    return;
  }

  data.goals.push({
    id: id(),
    name: String(name).trim(),
    target,
    saved,
    deadline,
    createdAt: today()
  });

  saveData();

  renderGoals();

  showToast("Goal created");
}

function addGoalSaving(
  goalId,
  amount
) {
  const goal =
    data.goals.find(
      x => x.id === goalId
    );

  amount = Number(amount);

  if (
    !goal ||
    amount <= 0
  ) {
    return;
  }

  goal.saved = Math.min(
    goal.target,
    goal.saved + amount
  );

  saveData();

  renderGoals();

  showToast(
    "Goal updated"
  );
}

function deleteGoal(goalId) {
  data.goals =
    data.goals.filter(
      goal =>
        goal.id !== goalId
    );

  saveData();

  renderGoals();

  showToast("Goal deleted");
}

window.addGoal = addGoal;
window.addGoalSaving =
  addGoalSaving;
window.deleteGoal =
  deleteGoal;

/* =========================================================
   BUDGET
========================================================= */

function addBudget(
  category,
  amount,
  month = today().slice(0, 7)
) {
  amount = Number(amount);

  if (
    !String(category || "").trim() ||
    amount <= 0
  ) {
    showToast(
      "Enter category and budget"
    );

    return;
  }

  data.budgets.push({
    id: id(),
    category: String(
      category
    ).trim(),
    amount,
    month
  });

  saveData();

  renderBudgets();

  showToast("Budget added");
}

function deleteBudget(
  budgetId
) {
  data.budgets =
    data.budgets.filter(
      x => x.id !== budgetId
    );

  saveData();

  renderBudgets();

  showToast(
    "Budget deleted"
  );
}

window.addBudget =
  addBudget;

window.deleteBudget =
  deleteBudget;

/* =========================================================
   BILLS
========================================================= */

function addBill(
  name,
  amount,
  dueDate,
  recurring = false
) {
  amount = Number(amount);

  if (
    !String(name || "").trim() ||
    amount <= 0 ||
    !dueDate
  ) {
    showToast(
      "Enter bill details"
    );

    return;
  }

  data.bills.push({
    id: id(),
    name: String(name).trim(),
    amount,
    dueDate,
    recurring,
    status: "pending"
  });

  saveData();

  renderBills();

  showToast("Bill added");
}

function markBillPaid(
  billId
) {
  const bill =
    data.bills.find(
      x => x.id === billId
    );

  if (!bill) return;

  bill.status =
    bill.status === "paid"
      ? "pending"
      : "paid";

  saveData();

  renderBills();
}

function deleteBill(
  billId
) {
  data.bills =
    data.bills.filter(
      x => x.id !== billId
    );

  saveData();

  renderBills();

  showToast("Bill deleted");
}

window.addBill = addBill;
window.markBillPaid =
  markBillPaid;
window.deleteBill =
  deleteBill;

/* =========================================================
   LOANS / EMI
========================================================= */

function addLoan(
  name,
  lender,
  amount,
  emi,
  dueDate,
  tenure = ""
) {
  amount = Number(amount);
  emi = Number(emi);

  if (
    !String(name || "").trim() ||
    amount <= 0 ||
    emi <= 0
  ) {
    showToast(
      "Enter loan details"
    );

    return;
  }

  data.loans.push({
    id: id(),
    name: String(name).trim(),
    lender: String(
      lender || ""
    ).trim(),
    amount,
    emi,
    dueDate,
    tenure,
    paidEmis: 0,
    status: "active"
  });

  saveData();

  renderLoans();

  showToast(
    "Loan / EMI added"
  );
}

function payEMI(loanId) {
  const loan =
    data.loans.find(
      x => x.id === loanId
    );

  if (!loan) return;

  loan.paidEmis++;

  saveData();

  renderLoans();

  showToast(
    "EMI marked paid"
  );
}

function deleteLoan(
  loanId
) {
  data.loans =
    data.loans.filter(
      x => x.id !== loanId
    );

  saveData();

  renderLoans();

  showToast(
    "Loan deleted"
  );
}

window.addLoan = addLoan;
window.payEMI = payEMI;
window.deleteLoan =
  deleteLoan;

/* =========================================================
   DASHBOARD
========================================================= */

function getTotals() {
  const income =
    data.transactions
      .filter(
        x => x.type === "income"
      )
      .reduce(
        (sum, x) =>
          sum + Number(x.amount),
        0
      );

  const expense =
    data.transactions
      .filter(
        x => x.type === "expense"
      )
      .reduce(
        (sum, x) =>
          sum + Number(x.amount),
        0
      );

  const given =
    data.lendings
      .filter(
        x =>
          x.type === "given" &&
          x.status === "pending"
      )
      .reduce(
        (sum, x) =>
          sum + Number(x.amount),
        0
      );

  const received =
    data.lendings
      .filter(
        x =>
          x.type === "received" &&
          x.status === "pending"
      )
      .reduce(
        (sum, x) =>
          sum + Number(x.amount),
        0
      );

  return {
    income,
    expense,
    balance:
      income - expense,
    given,
    received,
    lendingBalance:
      given - received
  };
}

function updateDashboard() {
  const totals =
    getTotals();

  setText(
    "totalIncome",
    money(totals.income)
  );

  setText(
    "totalExpense",
    money(totals.expense)
  );

  setText(
    "totalBalance",
    money(totals.balance)
  );

  setText(
    "moneyGiven",
    money(totals.given)
  );

  setText(
    "moneyReceived",
    money(totals.received)
  );

  setText(
    "netLendingBalance",
    money(
      totals.lendingBalance
    )
  );

  setText(
    "receivable",
    money(totals.given)
  );

  setText(
    "payable",
    money(totals.received)
  );

  const goalSaved =
    data.goals.reduce(
      (sum, goal) =>
        sum + Number(goal.saved),
      0
    );

  setText(
    "totalGoalSavings",
    money(goalSaved)
  );
}

/* =========================================================
   RENDER TRANSACTIONS
========================================================= */

function renderTransactions(
  containerId =
    "transactionList"
) {
  const container =
    getEl(containerId);

  if (!container) return;

  if (
    !data.transactions.length
  ) {
    container.innerHTML =
      `<div class="empty-state">
        No transactions yet
      </div>`;

    return;
  }

  const items =
    [...data.transactions]
      .reverse()
      .slice(0, 100);

  container.innerHTML =
    items.map(item => `
      <div class="transaction-item">

        <div>
          <strong>
            ${
              item.type === "income"
                ? "Income"
                : "Expense"
            }
          </strong>

          <div>
            ${safeText(
              item.note ||
              "No note"
            )}
          </div>

          <small>
            ${safeText(
              item.date
            )}
          </small>
        </div>

        <div>
          <strong>
            ${
              item.type === "income"
                ? "+"
                : "-"
            }${money(
              item.amount
            )}
          </strong>

          <button
            onclick="deleteTransaction('${item.id}')"
          >
            Delete
          </button>
        </div>

      </div>
    `).join("");
}

/* =========================================================
   RENDER LENDING
========================================================= */

function renderLendings(
  containerId =
    "lendingList"
) {
  const container =
    getEl(containerId);

  if (!container) return;

  if (
    !data.lendings.length
  ) {
    container.innerHTML =
      `<div class="empty-state">
        No Paisa Len-Den records
      </div>`;

    return;
  }

  container.innerHTML =
    [...data.lendings]
      .reverse()
      .map(item => `
        <div class="lending-item">

          <div>
            <strong>
              ${safeText(
                item.person
              )}
            </strong>

            <div>
              ${
                item.type === "given"
                  ? "Money Given"
                  : "Money Received"
              }
            </div>

            <small>
              ${safeText(
                item.date
              )}
            </small>

            ${
              item.dueDate
                ? `
                  <small>
                    Due:
                    ${safeText(
                      item.dueDate
                    )}
                  </small>
                `
                : ""
            }
          </div>

          <div>
            <strong>
              ${money(
                item.amount
              )}
            </strong>

            <div>
              ${safeText(
                item.status
              )}
            </div>

            <button
              onclick="markLendingPaid('${item.id}')"
            >
              ${
                item.status === "paid"
                  ? "Pending"
                  : "Paid"
              }
            </button>

            <button
              onclick="deleteLending('${item.id}')"
            >
              Delete
            </button>
          </div>

        </div>
      `)
      .join("");

  updateDashboard();
}

/* =========================================================
   RENDER GOALS
========================================================= */

function renderGoals(
  containerId =
    "goalList"
) {
  const container =
    getEl(containerId);

  if (!container) return;

  if (!data.goals.length) {
    container.innerHTML =
      `<div class="empty-state">
        No goals created
      </div>`;

    return;
  }

  container.innerHTML =
    data.goals
      .map(goal => {

        const percentage =
          Math.min(
            100,
            Math.round(
              (
                Number(goal.saved) /
                Number(goal.target)
              ) * 100
            )
          );

        return `
          <div class="goal-item">

            <div>
              <strong>
                ${safeText(
                  goal.name
                )}
              </strong>

              <div>
                ${money(
                  goal.saved
                )}
                /
                ${money(
                  goal.target
                )}
              </div>

              <div class="progress">
                <div
                  class="progress-bar"
                  style="width:${percentage}%"
                ></div>
              </div>

              <small>
                ${percentage}%
                completed
              </small>
            </div>

            <div>
              <button
                onclick="addGoalSaving('${goal.id}', 500)"
              >
                + ₹500
              </button>

              <button
                onclick="deleteGoal('${goal.id}')"
              >
                Delete
              </button>
            </div>

          </div>
        `;
      })
      .join("");
}

/* =========================================================
   RENDER BUDGET
========================================================= */

function renderBudgets(
  containerId =
    "budgetList"
) {
  const container =
    getEl(containerId);

  if (!container) return;

  if (!data.budgets.length) {
    container.innerHTML =
      `<div class="empty-state">
        No budgets created
      </div>`;

    return;
  }

  container.innerHTML =
    data.budgets
      .map(budget => {

        const spent =
          data.transactions
            .filter(
              x =>
                x.type === "expense" &&
                String(
                  x.date
                ).slice(0, 7) ===
                  budget.month
            )
            .reduce(
              (sum, x) =>
                sum +
                Number(
                  x.amount
                ),
              0
            );

        const remaining =
          Number(
            budget.amount
          ) - spent;

        return `
          <div class="budget-item">

            <strong>
              ${safeText(
                budget.category
              )}
            </strong>

            <div>
              Budget:
              ${money(
                budget.amount
              )}
            </div>

            <div>
              Spent:
              ${money(spent)}
            </div>

            <div>
              Remaining:
              <strong>
                ${money(
                  remaining
                )}
              </strong>
            </div>

            <button
              onclick="deleteBudget('${budget.id}')"
            >
              Delete
            </button>

          </div>
        `;
      })
      .join("");
}

/* =========================================================
   RENDER BILLS
========================================================= */

function renderBills(
  containerId =
    "billList"
) {
  const container =
    getEl(containerId);

  if (!container) return;

  if (!data.bills.length) {
    container.innerHTML =
      `<div class="empty-state">
        No bills added
      </div>`;

    return;
  }

  container.innerHTML =
    [...data.bills]
      .sort(
        (a, b) =>
          String(
            a.dueDate
          ).localeCompare(
            String(
              b.dueDate
            )
          )
      )
      .map(bill => `
        <div class="bill-item">

          <div>
            <strong>
              ${safeText(
                bill.name
              )}
            </strong>

            <div>
              ${money(
                bill.amount
              )}
            </div>

            <small>
              Due:
              ${safeText(
                bill.dueDate
              )}
            </small>
          </div>

          <div>
            <strong>
              ${safeText(
                bill.status
              )}
            </strong>

            <button
              onclick="markBillPaid('${bill.id}')"
            >
              ${
                bill.status === "paid"
                  ? "Pending"
                  : "Paid"
              }
            </button>

            <button
              onclick="deleteBill('${bill.id}')"
            >
              Delete
            </button>
          </div>

        </div>
      `)
      .join("");
}

/* =========================================================
   RENDER LOANS
========================================================= */

function renderLoans(
  containerId =
    "loanList"
) {
  const container =
    getEl(containerId);

  if (!container) return;

  if (!data.loans.length) {
    container.innerHTML =
      `<div class="empty-state">
        No loans / EMI added
      </div>`;

    return;
  }

  container.innerHTML =
    data.loans
      .map(loan => `
        <div class="loan-item">

          <div>
            <strong>
              ${safeText(
                loan.name
              )}
            </strong>

            <div>
              ${safeText(
                loan.lender ||
                "Bank / Finance"
              )}
            </div>

            <div>
              Loan:
              ${money(
                loan.amount
              )}
            </div>

            <div>
              EMI:
              ${money(
                loan.emi
              )}
            </div>

            <small>
              Paid EMIs:
              ${Number(
                loan.paidEmis || 0
              )}
            </small>
          </div>

          <div>
            <button
              onclick="payEMI('${loan.id}')"
            >
              Pay EMI
            </button>

            <button
              onclick="deleteLoan('${loan.id}')"
            >
              Delete
            </button>
          </div>

        </div>
      `)
      .join("");
}

/* =========================================================
   SEARCH
========================================================= */

function searchHisab(
  query
) {
  query =
    String(
      query || ""
    )
      .toLowerCase()
      .trim();

  if (!query) {
    renderTransactions();
    renderLendings();
    return;
  }

  const transactionResults =
    data.transactions.filter(
      item =>
        `${item.type} ${item.note} ${item.date}`
          .toLowerCase()
          .includes(query)
    );

  const lendingResults =
    data.lendings.filter(
      item =>
        `${item.person} ${item.type} ${item.note} ${item.date}`
          .toLowerCase()
          .includes(query)
    );

  const transactionContainer =
    getEl(
      "transactionList"
    );

  if (transactionContainer) {
    transactionContainer.innerHTML =
      transactionResults
        .map(item => `
          <div class="transaction-item">

            <strong>
              ${safeText(
                item.note ||
                item.type
              )}
            </strong>

            <span>
              ${money(
                item.amount
              )}
            </span>

          </div>
        `)
        .join("") ||
      `<div class="empty-state">
        No result found
      </div>`;
  }

  const lendingContainer =
    getEl(
      "lendingList"
    );

  if (lendingContainer) {
    lendingContainer.innerHTML =
      lendingResults
        .map(item => `
          <div class="lending-item">

            <strong>
              ${safeText(
                item.person
              )}
            </strong>

            <span>
              ${money(
                item.amount
              )}
            </span>

          </div>
        `)
        .join("") ||
      `<div class="empty-state">
        No result found
      </div>`;
  }
}

window.searchHisab =
  searchHisab;

/* =========================================================
   REPORT
========================================================= */

function getReport() {
  const totals =
    getTotals();

  return {
    totalIncome:
      totals.income,

    totalExpense:
      totals.expense,

    balance:
      totals.balance,

    moneyGiven:
      totals.given,

    moneyReceived:
      totals.received,

    goals:
      data.goals.length,

    bills:
      data.bills.length,

    loans:
      data.loans.length,

    transactions:
      data.transactions.length
  };
}

window.getReport =
  getReport;

/* =========================================================
   BACKUP
========================================================= */

function exportBackup() {
  const backup =
    JSON.stringify(
      data,
      null,
      2
    );

  const blob =
    new Blob(
      [backup],
      {
        type:
          "application/json"
      }
    );

  const url =
    URL.createObjectURL(
      blob
    );

  const a =
    document.createElement(
      "a"
    );

  a.href = url;

  a.download =
    `HISAB-Backup-${today()}.json`;

  a.click();

  URL.revokeObjectURL(
    url
  );

  showToast(
    "Backup exported"
  );
}

function importBackup(
  file
) {
  if (!file) return;

  const reader =
    new FileReader();

  reader.onload =
    event => {
      try {
        const imported =
          JSON.parse(
            event.target.result
          );

        if (
          !imported.transactions
        ) {
          throw new Error(
            "Invalid backup"
          );
        }

        data = {
          ...structuredClone(
            defaultData
          ),

          ...imported,

          settings: {
            ...structuredClone(
              defaultData.settings
            ),

            ...(imported.settings ||
              {})
          }
        };

        saveData();

        renderAll();

        showToast(
          "Backup restored"
        );

      } catch (error) {
        showToast(
          "Invalid backup file"
        );
      }
    };

  reader.readAsText(file);
}

window.exportBackup =
  exportBackup;

window.importBackup =
  importBackup;

/* =========================================================
   RESET
========================================================= */

function resetHisabData() {
  const confirmed =
    confirm(
      "All HISAB data will be deleted. Continue?"
    );

  if (!confirmed) {
    return;
  }

  localStorage.removeItem(
    HISAB_KEY
  );

  localStorage.removeItem(
    "hisab_guest_mode"
  );

  data =
    structuredClone(
      defaultData
    );

  renderAll();

  showToast(
    "All data cleared"
  );
}

window.resetHisabData =
  resetHisabData;

/* =========================================================
   TOAST
========================================================= */

function showToast(
  message
) {
  let toast =
    getEl(
      "hisabToast"
    );

  if (!toast) {
    toast =
      document.createElement(
        "div"
      );

    toast.id =
      "hisabToast";

    Object.assign(
      toast.style,
      {
        position:
          "fixed",

        left:
          "50%",

        bottom:
          "25px",

        transform:
          "translateX(-50%)",

        padding:
          "12px 18px",

        borderRadius:
          "12px",

        background:
          "#111827",

        color:
          "#fff",

        zIndex:
          "99999",

        fontSize:
          "14px",

        maxWidth:
          "90%",

        textAlign:
          "center"
      }
    );

    document.body.appendChild(
      toast
    );
  }

  toast.textContent =
    message;

  toast.style.display =
    "block";

  clearTimeout(
    window.hisabToastTimer
  );

  window.hisabToastTimer =
    setTimeout(
      () => {
        toast.style.display =
          "none";
      },
      2200
    );
}

window.showToast =
  showToast;

/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {
  updateDashboard();

  renderTransactions();

  renderLendings();

  renderGoals();

  renderBudgets();

  renderBills();

  renderLoans();

  document
    .querySelectorAll(
      ".mode-btn"
    )
    .forEach(btn => {
      btn.classList.toggle(
        "active",
        btn.dataset.mode ===
          data.mode
      );
    });
}

/* =========================================================
   BUTTON / FORM AUTO HANDLER
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    restoreGuestMode();

    renderAll();

    const incomeForm =
      getEl(
        "incomeForm"
      );

    if (incomeForm) {

      incomeForm.addEventListener(
        "submit",
        e => {

          e.preventDefault();

          const amount =
            incomeForm
              .querySelector(
                "[name='amount']"
              )
              ?.value;

          const note =
            incomeForm
              .querySelector(
                "[name='note']"
              )
              ?.value || "";

          const date =
            incomeForm
              .querySelector(
                "[name='date']"
              )
              ?.value ||
            today();

          addIncome(
            amount,
            note,
            date
          );

          incomeForm.reset();
        }
      );
    }

    const expenseForm =
      getEl(
        "expenseForm"
      );

    if (expenseForm) {

      expenseForm.addEventListener(
        "submit",
        e => {

          e.preventDefault();

          const amount =
            expenseForm
              .querySelector(
                "[name='amount']"
              )
              ?.value;

          const note =
            expenseForm
              .querySelector(
                "[name='note']"
              )
              ?.value || "";

          const date =
            expenseForm
              .querySelector(
                "[name='date']"
              )
              ?.value ||
            today();

          addExpense(
            amount,
            note,
            date
          );

          expenseForm.reset();
        }
      );
    }

    const searchInput =
      getEl(
        "hisabSearch"
      );

    if (searchInput) {

      searchInput.addEventListener(
        "input",
        e => {
          searchHisab(
            e.target.value
          );
        }
      );
    }

  }
);

/* =========================================================
   GLOBAL ACCESS
========================================================= */

window.HISAB = {

  getData:
    () => data,

  save:
    saveData,

  totals:
    getTotals,

  addTransaction,

  addLending,

  addGoal,

  addBudget,

  addBill,

  addLoan,

  exportBackup,

  reset:
    resetHisabData
};
