# Coastal Inventory Logger

Internal inventory entry logging app, built with Next.js and hosted via Azure Static Web Apps. 

---

## Table of Contents
- [Project Overview](#project-overview)  
- [Getting Started](#getting-started)  
- [Usage](#usage)  
- [Local Development](#local-development)  
- [Deployment](#deployment)  
- [Architecture & Key Files](#architecture--key-files)  
- [Future Plans](#future-plans)  
- [Access & Next Steps](#access--next-steps)  

---

## Project Overview

This is a lightweight inventory logging system. Users fill out a simple form to record entries, and these submissions post to an Azure Functions endpoint (`/api/save-inventory`) that currently logs data to the backend console. Future enhancements include saving entries to SharePoint or Azure Cosmos DB.

---

## Getting Started

1. **Clone the repo**  
   ```bash
   git clone https://github.com/DevDizzle/coastal-inventory-logger.git
   cd coastal-inventory-logger
