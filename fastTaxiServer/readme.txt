FastTaxi Server
This document provides instructions on how to set up and start the FastTaxi server.

Prerequisites
Before starting the server, ensure you have the following installed on your system:

Node.js (v14 or higher) - Download Node.js
npm (Node Package Manager) - Comes with Node.js
TypeScript - Install globally using:
MongoDB - Ensure MongoDB is installed and running locally or on a remote server.
Steps to Start the Server
1. Clone the Repository
Clone the FastTaxi server repository to your local machine:

2. Navigate to the Project Directory
Change into the project directory:

3. Install Dependencies
Install all required dependencies using npm:

4. Configure the Database
Ensure MongoDB is running locally or remotely. By default, the server connects to a MongoDB instance at:

If you need to change the database connection string, update the connectDatabase function in src/config/database.ts.

5. Compile TypeScript (Optional)
If you want to compile the TypeScript files into JavaScript, run:

This will generate a dist/ folder with the compiled JavaScript files.

6. Start the Server
To start the server, run the following command:

If you compiled the TypeScript files, you can start the server using the compiled JavaScript:

7. Verify the Server
Once the server is running, you should see the following message in the terminal:

API Endpoints
The server exposes the following REST API endpoints:

Driver Routes
GET /api/drivers - Fetch all drivers
GET /api/drivers/:id - Fetch a specific driver by ID
Ride Routes
GET /api/rides - Fetch all ride requests
PUT /api/rides/:requestId - Update the status of a ride request
Socket.IO Events
The server also supports real-time communication via Socket.IO. Below are the supported events:

Client-to-Server Events
driverOnline - Register a driver as online
rideRequest - Submit a new ride request
Server-to-Client Events
rideAccepted - Notify the client when a driver accepts their ride
rideExpired - Notify the client when their ride request expires
noDriversNearby - Notify the client when no drivers are available nearby
Troubleshooting
MongoDB Connection Error:

Ensure MongoDB is running locally or update the connection string in src/config/database.ts.
TypeScript Not Found:

Install TypeScript globally using:
Port Already in Use:

Ensure no other application is using port 3000, or change the port in src/server.ts.
Stopping the Server
To stop the server, press Ctrl + C in the terminal where the server is running.

