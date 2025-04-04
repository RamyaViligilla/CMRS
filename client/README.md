# Clinical Research Management System: Application Execution Guide

This guide explains how to run both the frontend and backend components of our Clinical Research Management System.

## Frontend Execution

To run the frontend of the application:

1. Navigate to the client directory:

   ```
   cd ~/Desktop/code/client
   ```

2. Start the development server:

   ```
   npm run dev
   ```

3. You should see output similar to:
   ```
   > vite-template@0.0.0 dev
   > vite
     VITE v5.2.13  ready in 344 ms
     ➜  Local:   http://localhost:5173/
     ➜  Network: use --host to expose
     ➜  press h + enter to show help
   ```

Explanation:

- The frontend uses Vite as a build tool and development server.
- The application is running locally at `http://localhost:5173/`.
- You can access the application by opening this URL in your web browser.
- The "--host" option can be used to make the application accessible over your local network.
- Pressing 'h' and Enter will display additional help options.

## Backend Execution

To run the backend of the application:

1. Navigate to the server directory:

   ```
   cd ~/Desktop/code/server
   ```

2. Start the development server:

   ```
   npm run dev
   ```

3. You should see output similar to:
   ```
   > server@1.0.0 dev
   > nodemon
   [nodemon] 3.1.3
   [nodemon] to restart at any time, enter `rs`
   [nodemon] watching path(s): src/**/*
   [nodemon] watching extensions: ts,json
   [nodemon] starting `ts-node ./src/index.ts`
   Server is running at http://localhost:3500
   MongoDB connected...
   ```

Explanation:

- The backend uses Nodemon for automatic server restarts during development.
- The server is written in TypeScript and uses ts-node to execute it.
- The backend server is running at `http://localhost:3500`.
- Nodemon is watching for changes in the `src` directory and will restart the server if any `.ts` or `.json` files are modified.
- You can manually restart the server by typing `rs` and pressing Enter.
- The last line confirms that the server has successfully connected to the MongoDB database.

## Running the Full Application

To run the full application:

1. Start the backend server first, following the backend execution steps.
2. In a new terminal window, start the frontend server following the frontend execution steps.
3. Ensure both servers are running without errors.
4. Access the application by opening `http://localhost:5173/` in your web browser.

Note: Ensure that all necessary dependencies are installed in both the client and server directories by running `npm install` before attempting to start the servers.
