console.clear();

function Task(description, cost) {
    this.id = uniqId();
    this.description = description;
    this.cost = cost;

    function uniqId() {
        return Math.random().toString(16).slice(2);
    }

    if(new.target === undefined){
        throw new Error('Task cannot be called without "new"');
    }
}

class IncomeTask extends Task {
    constructor(description, cost) {
        super(description, cost);
    }

    makeDone(budget) {
        budget.income += this.cost;
    }

    makeUnDone(budget) {
        budget.income -= this.cost;
    }
}

class ExpenseTask extends Task {
    constructor(description, cost) {
        super(description, cost);
    }

    makeDone(budget) {
        budget.expenses += this.cost;
    }

    makeUnDone(budget) {
        budget.expenses -= this.cost;
    }
}

class TaskController {
    #tasks;

    constructor() {
        this.#tasks = [];
    }

    addTasks(...tasks) {
        tasks.forEach(function(task)  {
            if (!this.#tasks.includes(task)) {
                this.#tasks.push(task);
            }
        },this);
    }

    getTasks() {
        return this.#tasks;
    }

    deleteTask(task) {
        this.#tasks = this.#tasks.filter(function(t) {
            return t.id !== task.id;
        });
    }

    getTasksSortedBy(sortBy) {
        return [...this.tasks].sort(function(a, b) {
            if (sortBy === 'description') {
                const desc1 = a.description.toLowerCase();
                const desc2 = b.description.toLowerCase();
                if (desc1 > desc2) return 1;
                if (desc1 < desc2) return -1;
            } else if (sortBy === 'status') {
                if (a.status && typeof a.status === 'string' && b.status && typeof b.status === 'string') {
                    const status1 = a.status.toLowerCase();
                    const status2 = b.status.toLowerCase();
                    if (status1 > status2) return 1;
                    if (status1 < status2) return -1;
                }
            } else if (sortBy === 'cost') {
                return a.cost - b.cost;
            }
            return 0;
        });
    }

    getFilteredTasks(filter) {
        return this.#tasks.filter(function(task) {
            if (filter.description) {
                if (!task.description.toLowerCase().includes(filter.description.toLowerCase())) {
                    return false;
                }
            }

            if (typeof filter.isIncome === 'boolean') {
                if (filter.isIncome && !(task instanceof IncomeTask)) {
                    return false;
                }
                if (!filter.isIncome && !(task instanceof ExpenseTask)) {
                    return false;
                }
            }

            if (typeof filter.isCompleted === 'boolean') {
                if (filter.isCompleted && !task.isCompleted) {
                    return false;
                }
                if (!filter.isCompleted && task.isCompleted) {
                    return false;
                }
            }

            return true;
        });
    }
}

class BudgetController {
    #tasksController;
    #budget;

    constructor(initialBalance = 0) {
        this.#tasksController = new TaskController();
        this.#budget = {
            balance: initialBalance,
            income: 0,
            expenses: 0,
        };
    }

    get balance() {
        return this.#budget.balance;
    }

    get income() {
        return this.#budget.income;
    }

    get expenses() {
        return this.#budget.expenses;
    }

    calculateBalance() {
        return this.#budget.balance + this.#budget.income - this.#budget.expenses;
    }

    getTasks() {
        return this.#tasksController.getTasks();
    }

    addTasks(...tasks) {
        this.#tasksController.addTasks(...tasks);
    }

    deleteTask(task) {
        if (!this.#tasksController.getTasks().includes(task)) {
            console.log(`Task ${task.id} isn't recognized`);
            return;
        }

        if (task.isCompleted) {
            this.unDoneTask(task);
        }

        this.#tasksController.deleteTask(task);
    }

    doneTask(task) {
        if (!this.#tasksController.getTasks().includes(task)) {
            console.log(`Task ${task.id} isn't recognized`);
            return;
        }

        if (task.isCompleted) {
            console.log('Task is already done');
            return;
        }

        task.makeDone(this.#budget);
    }

    unDoneTask(task) {
        if (!this.#tasksController.getTasks().includes(task)) {
            console.log(`Task ${task.id} isn't recognized`);
            return;
        }

        if (!task.isCompleted) {
            console.log('Task isn\'t done before');
            return;
        }

        task.makeUnDone(this.#budget);
    }

    getFilteredTasks(filter) {
        return this.#tasksController.getFilteredTasks(filter);
    }
};