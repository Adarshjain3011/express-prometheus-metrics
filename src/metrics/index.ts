import { NextFunction, Request, Response } from "express";
import client from "prom-client";

// Import or define custom metrics
import { activeRequestsGauge } from "./activeUserRequests";
import { requestCounter } from "./requestCounter";

// Define a histogram for request duration
export const httpRequestDurationHistogram = new client.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 5, 15, 50, 100, 300, 500, 1000, 3000, 5000] // Buckets in milliseconds
});

// Middleware to track active requests, request durations, and request counts
export const cleanupMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const startTime = process.hrtime();  // Start high-resolution timer
    activeRequestsGauge.inc();           // Increment active request count

    // Wrap the `res.on('finish')` to capture when the request completes
    res.on('finish', () => {
        const durationInMilliseconds = getDurationInMilliseconds(startTime); // Calculate request duration

        console.log(`Request took ${durationInMilliseconds.toFixed(3)} ms`);

        // Increment the request counter with method, route, and status code labels
        requestCounter.inc({
            method: req.method,
            route: req.route ? req.route.path : req.path,
            status_code: res.statusCode,
        });

        // Observe the duration in the histogram with appropriate labels
        httpRequestDurationHistogram.observe({
            method: req.method,
            route: req.route ? req.route.path : req.path,
            status_code: res.statusCode.toString(),
        }, durationInMilliseconds);

        activeRequestsGauge.dec();  // Decrement active request count
    });

    // Handle cases where the connection closes prematurely
    res.on('close', () => {
        activeRequestsGauge.dec();
    });

    next();  // Pass control to the next middleware
};

// Helper function to calculate duration in milliseconds
function getDurationInMilliseconds(start: [number, number]): number {
    const diff = process.hrtime(start);
    return diff[0] * 1e3 + diff[1] / 1e6;  // Convert [seconds, nanoseconds] to milliseconds
}
