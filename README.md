# Coastal Inventory Logger

Internal inventory entry logging app built with Next.js and hosted via Azure Static Web Apps.
Form submissions are sent to an Azure Functions endpoint (`/api/save-inventory`) that writes rows to Azure SQL via the SQL output binding.

---

## Core Features

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
   This starts the Next.js app on [http://localhost:9002](http://localhost:9002).
4. **Start the Static Web Apps CLI**
   ```bash
   npm i -g @azure/static-web-apps-cli
   swa start http://localhost:9002 --api-location ./api
   ```
   Visit [http://localhost:4280](http://localhost:4280) for the combined app and API.

### Testing the API locally

```bash
curl -X POST "http://localhost:4280/api/save-inventory" \
     -H "Content-Type: application/json" \
     -d '{"MaterialCode":"TEST","Quantity":1}'
```

## API

### `POST /api/save-inventory`

Accepts a JSON object or array where each object maps to columns in the SQL table:

- `MaterialCode` (string, required)
- `Quantity` (number, required)
- `Unit` (string, optional)
- `Location` (string, optional)
- `Notes` (string, optional)

Returns `201 { inserted: <count> }` on success.

## Deployment
- Hosted on Azure Static Web Apps.
- API located in /api folder (Azure Functions).

### Configure the database connection

In the Static Web Apps portal, add an app setting:

```
Name: SqlConnectionString
Value: Server=tcp:<AZURE_SQL_SERVER>,1433;Database=<AZURE_SQL_DB>;User ID=<user>;Password=<password>;Encrypt=True;TrustServerCertificate=False;
```

Ensure the Azure SQL firewall allows access from Static Web Apps (for example, enable "Allow Azure services").
