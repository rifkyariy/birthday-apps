import express, { Request, Response, NextFunction } from 'express';
import routes from './routes';

const app = express();
app.use(express.json());

app.use(routes);

app.get('/', (req, res) => {
  res.send('It`s works!');
});

// app.get('/test/messages', async (req, res) => {
//   const url = `${process.env.EMAIL_SERVICE_URL}/send-email`;
//   const requestOptions = {
//     method: 'POST',
//     headers: {
//       'Accept': 'application/json',
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       email: 'test@digitalenvision.com.au',
//       message: 'Hi, nice to meet you.'
//     })
//   };

//   fetch(url, requestOptions)
//     .then(response => response.json())
//     .then(data => {
//       console.log('Response:', data);
//     })
//     .catch(error => {
//       console.error('Error:', error);
//     });
// });

// Error handler middleware for handling unknown routes
app.use((req: Request, res: Response, next: NextFunction) => {
  const errorResponse = {
    status: 404,
    message: 'Endpoint not found',
  };
  res.status(404).json(errorResponse);
});

// 
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
