# Coastal Inventory Logger

A simple web app to capture inventory entries and log them cleanly—designed for easy deployment via Azure Static Web Apps.

---

##  Table of Contents
- [Project Overview](#project-overview)  
- [Getting Started](#getting-started)  
- [Usage](#usage)  
- [Local Development](#local-development)  
- [Deployment L0ugar](#deployment-locations)  
- [Architecture & Files](#architecture--files)  
- [Future Enhancements](#future-enhancements)  
- [Contributing](#contributing)  
- [License](#license)  

---

## Project Overview

Coastal Inventory Logger is a lightweight Next.js app that allows users to input inventory entries via a web form. On submit, entries are posted to `/api/save-inventory`—currently logging data to the server console, with future plans to persist entries to SharePoint or Cosmos DB.

---

## Getting Started

1. **Clone the repository**
    ```bash
    git clone https://github.com/DevDizzle/coastal-inventory-logger.git
    cd coastal-inventory-logger
    ```

2. **Install dependencies**
    ```bash
    npm install
    ```

3. **Run your app**
    ```bash
    npm run dev
    ```
   Then open: `http://localhost:3000`

---

## Usage

- Fill out the inventory form and submit.
- When deployed to Azure Static Web Apps, entries will appear in the **Functions logs**.
- Console-log output provides immediate confirmation of API hits.

---

## Local Development Workflow

- Start the frontend:
    ```bash
    npm run dev
    ```
- (Optional) Install and run the SWA CLI to test API locally:
    ```bash
    npm install -D @azure/static-web-apps-cli
    npx swa start http://localhost:3000 --api-location ./api
    ```
- Submit forms locally and check console output in your terminal.

---

## Deployment Locations

| Environment | Description |
|-------------|-------------|
| **Azure Static Web Apps** | Hosts the frontend and the serverless API merged via `/api` folder (Azure Functions) |
| **Static Web App Functions Logs** | Check here to see your entries via `console.log` under your SWA environment in Azure Portal |

---

## Architecture & Files

- **Framework**: Built with Next.js — offering static or dynamic consumption of entries
- **`public/`**: Static assets
- **`api/`**: Azure Functions endpoint `save-inventory` logs form submissions
- **`next.config.js`**: Project configuration
- **`staticwebapp.config.json`**: SWA routing/config rules

---

## Future Enhancements

- Persist entries to **SharePoint** via Microsoft Graph API
- Store data in **Azure Cosmos DB**
- Add secure user authentication
- Viewable dashboard of submitted entries

---

## Contributing

All contributions are welcome! Suggested improvements:

- New features or UI polish
- Integrations (Cosmos DB, SharePoint)
- Unit tests, CI enhancements, docs

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
