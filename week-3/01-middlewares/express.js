const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.use(express.json())

app.post("/sum", function(req, res) {
  const a = parseInt(req.body?.a || 0);
  const b = parseInt(req.body?.b || 0);
  res.json({
    result: a+b
  })
});


app.listen(3000, () =>{
  console.log(`Server is running on port ${3000}`);
})