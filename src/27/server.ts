import express from 'express';

const PORT = 8080;

const app = express();

app.use(express.json());
app.use(express.text());

app.get('/limited', (req, res) => {
  res.send('Limited API endpoint\n');
});

app.get('/unlimited', (req, res) => {
  res.send('Unlimited API endpoint\n');
});

app.listen(PORT, () => {
  console.log('Started server on port ' + PORT);
});
