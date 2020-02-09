const express = require('express');

const server = express();
server.use(express.json());

let callCount = 0;
const projects = [];

function logRequests(req, res, next) {
  console.log(`${req.method} - ${req.url} | #reqs: ${++callCount}`);
  next();
}

server.use(logRequests);

function checkProjectExists(req, res, next) {
  const { id } = req.params;
  const project = projects.find((p) => p.id == id);
  if (!project) {
    return res.status(400).json({error: "Project does not exist"});
  }
  req.project = project;
  next();
}

function checkProjectParams(req, res, next) {
  const { id, title } = req.body;
  if (id==undefined || title==undefined) {
    return res.status(400).json({error: `Id and Title are required params`});
  }
  next();
}

server.post('/projects', checkProjectParams, (req, res) => {
  // receive { id: "1", title: 'Novo projeto', tasks: [] }
  const { id, title } = req.body;
  projects.push({
    id,
    title,
    tasks: []
  });
  return res.json({projects});
});

server.get('/projects', (req, res) => res.json({projects}));

server.get('/projects/:id', checkProjectExists, (req, res) => res.json({project: req.project}));

server.put('/projects/:id', checkProjectExists, (req, res) => {
  let { project } = req;
  const { title } = req.body;
  project.title = title;
  return res.json({project});
});

server.delete('/projects/:id', checkProjectExists, (req, res) => {
  const { project } = req;
  const projectIndex = projects.findIndex((p)=> p.id == project.id);
  projects.splice(projectIndex, 1);
  return res.json({projects});
});

server.get('/projects/:id/tasks', checkProjectExists, (req, res) => res.json({tasks: req.project.tasks}));

server.post('/projects/:id/tasks', checkProjectExists, (req, res) => {
  const { title } = req.body;
  const { project } = req;
  project.tasks.push(title);
  return res.json({projects});
});

server.listen(5555);