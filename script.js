const url = "https://graphqlzero.almansi.me/api";

const addForm = document.forms.addtask;
const searchForm = document.forms.findtask;
const todos = document.getElementById("todos");

addForm.addEventListener("submit", addTaskHandler);
searchForm.addEventListener("submit", findTodos);

// Запрос
const makeRequest = (query) =>
    fetch(url, {
        method: "POST",
        headers: {
            "Content-type": "application/json",
        },
        body: JSON.stringify({ query }),
    }).then((res) => res.json());

// Друк Todoshok
function printTodo({ title, completed = false, id = "", user = {} }) {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.innerHTML = `:nbsp; ${title} | ID: ${id} | by <b>${user.name}</b>`;
    li.setAttribute("data-id", id);

    const checkBox = document.createElement("input");
    checkBox.type = "checkbox";
    if (completed) {
        checkBox.setAttribute("checked", "true");
    }
    checkBox.addEventListener("change", handleTodoStatus);
    li.prepend(checkBox);

    const del = document.createElement("button");
    del.className = "btn btn-link mb-1";
    del.innerHTML = "&times;";
    del.addEventListener("click", handleDeleteTodo);

    li.append(del);
    todos.prepend(li);
}
// Додавання todo
async function addTaskHandler(e) {
    e.preventDefault();
    if (addForm.taskname.value) {
        const newTaskQuery = `mutation CreateTodo {createTodo(input:{title: "${addForm.taskname.value}", completed: false})
      {
          title
          completed
          id
        }
      }`;
        const data = await makeRequest(newTaskQuery);
        printTodo(data.data.createTodo);
        addForm.reset();
    }
}
// Пошук Todo
async function findTodos(e) {
    e.preventDefault();
    const searchText = searchForm.searchname.value;

    if (searchText) {
        const searchQuery = `query searchQuery{
        todos(options:{search:{q: "${searchText}"}, sort:{field: "id", order: DESC}}){
            data {
              id
              title
              completed
              user { name }
            }
          }
    }`;
        const { data } = await makeRequest(searchQuery);
        todos.innerHTML = "";
        data.todos.data.forEach((todo) => printTodo(todo));
    }
}

// Зміна статусу
async function handleTodoStatus() {
    const todoId = this.parentElement.dataset.id;

    const changeStatusQuery = `mutation ChangeStatus {
      updateTodo(id: "${todoId}", input: {completed: ${this.checked}}) {
        completed
      }
    }`;

    const { data } = await makeRequest(changeStatusQuery);
    if (data.updateTodo.completed) {
        this.setAttribute("checked", "true");
    } else {
        this.removeAttribute("checked");
    }
}
// Delete Todo
async function handleDeleteTodo() {
    const todoId = this.parentElement.dataset.id;

    const deleteQuery = `mutation DeleteTodo {
    deleteTodo(id: "${todoId}")
  }`;

    const { data } = await makeRequest(deleteQuery);
    if (data.deleteTodo) {
        this.parentElement.remove();
    }
}

makeRequest(`query Todos($options:PageQueryOptions) {
    todos(options:$options){
      data {
        id
        title
        completed
        user {
          name
        }
      }
    }
  }`).then(({ data }) =>
    data.todos.data.forEach((todo) => {
        printTodo(todo);
    })
);
