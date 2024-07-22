# SHOP EASE API

## Description

Shop-ease api

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL

## Installation

1. **Clone the repository:**

    ```sh
    git clone <repository-link>
    cd <repository-directory>
    ```

2. **Install dependencies:**

    ```sh
    npm install
    ```

3. **Create a `.env` file in the root directory of your project with the following content:**

    ```env
    user=
    host=localhost
database=shop_ease
password=
PORT=5432
SERVER_PORT=5000
NODE_ENV=development
JWT_SECRET=

    ```

4. **Start PostgreSQL server:**
    Ensure your PostgreSQL server is running. You can start it using the following command on Windows:

    ```sh
    net start postgresql-x64-13
    ```

    (Replace `postgresql-x64-13` with your PostgreSQL version if different.)

5. **Run database migrations (if any):**

    ```sh
    npm run migrate
    ```

6. **Start the Express server:**

    ```sh
    npm start
    ```

## Usage

Once the server is running, you can access it at `http://localhost:5000`.


