const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  if (!username) {
    return response.status(400).json({error: "Username not informed"})
  }

  const user = users.find( user => user.username === username);

  if (!user) {
    return response.status(400).json({error: "User not exists!"})
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExist = users.some((user) => user.username === username);

  if (userAlreadyExist) {
    return response.status(400).json({error: "Username Already exist!"});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline,
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const findTodo = user.todos.find((todo) => todo.id === id);

  if (!findTodo) {
    return response.status(404).json({error: 'This todo id not found!'})
  }

  findTodo.title = title;
  findTodo.deadline = deadline;
 
  return response.status(201).json(findTodo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const findTodo = user.todos.find((todo) => todo.id === id);

  if (!findTodo) {
    return response.status(404).json({error: 'This todo id not found!'})
  }

  findTodo.done = true;
 
  return response.status(201).json(findTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const findTodo = user.todos.find((todo) => todo.id === id);

  if (!findTodo) {
    return response.status(404).json({error: 'This todo id not found!'})
  }

  const indexTodo = user.todos.indexOf(id)

  user.todos.splice(indexTodo, 1)
 
  return response.status(204).send()
});

module.exports = app;