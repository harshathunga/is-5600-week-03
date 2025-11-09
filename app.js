import express from "express";
import cors from "cors";
const router = express.Router();
import { fileURLToPath } from 'url';
import path from 'path';

import EventEmitter from 'events';
// const EventEmitter = require('events');
const chatEmitter = new EventEmitter();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from "public" folder


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use(router);

app.use(express.static(path.join(__dirname, 'public')));

// router.get("/", (req, res) => {
//     res.send("<h1>hi welcome to the API</h1>")
//   });

function respondJson(req, res) {
  // express has a built in json method that will set the content type header
  res.json({
    text: 'hi',
    numbers: [1, 2, 3],
  });
}


function echo(req, res){
    const {input = " "} = req.query;

    res.json({ 

        normal: input,
        shouty: input.toUpperCase(),
        charCount: input.length,
        backwards: input.split('').reverse().join(''),
    })
}

function chatApp(req, res) {
  res.sendFile(path.join(__dirname, '/chat.html')); 
}

function respondChat(req, res) {
  const { message } = req.query;
  chatEmitter.emit('message', message);
  res.end();
}

function respondNotFound(req, res) {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
}


function respondSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
  });

  const onMessage = message => res.write(`data: ${message}\n\n`);
  chatEmitter.on('message', onMessage);

  res.on('close', () => {
    chatEmitter.off('message', onMessage);
  });
}



app.get('/', chatApp);
app.get('/json', respondJson);
app.get('/echo', echo);
app.get('/chat', respondChat);
app.get('/sse', respondSSE);

app.listen(3001, () => {

    console.log("server is running in 3001") 
})

