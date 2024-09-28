import express, { Request, Response } from 'express';
import client from 'prom-client';
import { cleanupMiddleware } from './metrics';

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Custom cleanup middleware
app.use(cleanupMiddleware);

// Prometheus metric setup (example, if not already done)

// Automatically collect default metrics every 10 seconds (default interval)

// const collectDefaultMetrics = client.collectDefaultMetrics;
// collectDefaultMetrics(); // This collects default system metrics

// Start server
app.listen(3000, () => {
  console.log("Listening on port 3000");
});

// Default route
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the API");
});

// User route with a delay to simulate long response
app.get("/user", (req: Request, res: Response) => {
//   setTimeout(() => {
    res.send({
      name: "John Doe",
      age: 25,
    });

});

// POST route for user creation
app.post("/user", (req: Request, res: Response) => {
  const user = req.body;
  res.send({
    ...user,
    id: 1, // Return a new ID for the created user
  });
});

// Metrics endpoint
app.get("/metrics", async (req: Request, res: Response) => {
  try {
    const metrics = await client.register.metrics(); // Fetch metrics
    res.set('Content-Type', client.register.contentType); // Set appropriate content type
    res.end(metrics); // Send the metrics
  } catch (err) {
    res.status(500).send('Error fetching metrics'); // Handle errors gracefully
  }
});
