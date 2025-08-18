# Coastal Inventory Logger

Internal inventory entry logging app built with Next.js and hosted via Azure Static Web Apps.  
Currently, form submissions are sent to an Azure Function (`/api/save-inventory`) that logs entries to the console.  
Future enhancements include persistence to SharePoint or Cosmos DB.

---

## Core Features (Planned)

- **Authorized Access**: Validate user emails against an approved list.  
- **Staging Table**: Hold multiple entries in the UI before submission.  
- **Batch Submission**: Submit all staged entries at once.  
- **Material Suggestions**: Provide industry-specific material suggestions via LLM.  
- **Automated Emails**: Send confirmation emails for each submission.


---

## Getting Started

1. **Clone the repo**  
   ```bash
   git clone https://github.com/DevDizzle/coastal-inventory-logger.git
   cd coastal-inventory-logger
   ```
2. **Install dependencies** 
   ```bash
   npm install
   ```
3. **Run locally**
   ```bash
   npm run dev
   ```
   Visit [http](http://localhost:3000)

## Deployment
-Hosted on Azure Static Web Apps.
-API located in /api folder (Azure Functions).
-Check Functions logs in Azure Portal to see submitted entries.
