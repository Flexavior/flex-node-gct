# Google Cloud Translation API Service with NodeJS

This project provides an **authenticated, self-hosted server application** built with **Node.js** and **Express.js** to proxy requests to the **Google Cloud Translation API (v2)**. It's designed for production use, featuring API Key management, custom Bearer token authorization, and daily logging of all translation requests.

## Features

* **Google Cloud Translation API (v2) Integration:** Uses the standard Google HTTP endpoint.
* **Secure Access:** Requires both a **Google API Key** and a custom **Bearer Authentication Token**.
* **Request Logging:** All translation requests are logged daily into **JSON Lines (`.jsonl`)** files within a `logs/` directory for auditing.
* **Default Source Language:** Optimized for translating text **from Myanmar (`my`)**.
* **Health Check Endpoint:** Simple `/health` route for monitoring.
* **Environment Variables:** Configuration via **`.env`** file for secure credentials.


### Prerequisites

You'll need the following installed:

* **Node.js** (LTS version recommended)
* **npm** (comes with Node.js)
* A **Google Cloud Project** with the **Cloud Translation API** enabled.
* A **Google API Key** for API authentication.

### Example Request
curl -X POST http://localhost:4000/translate \
  -H "Authorization: Bearer YOUR_SECURE_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text": "အေးချမ်းပါစေ", "target": "en"}'

### Response
A successful request returns a JSON object containing the translation, the original input, and a unique requestId for logging purposes.
Successful Response (200 OK):  

JSON  
{  
  "timestamp": "2025-10-02T10:00:00.000Z",  
  "requestId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",  
  "input": "အေးချမ်းပါစေ",  
  "output": "May there be peace",  
  "target": "en"  
}  

________________________________________
### Logging
Every successful request to /translate automatically generates a log entry and appends it to a daily log file.  
•	Location: Logs are stored in the ./logs directory.  
•	Filename Format: translations-YYYY-MM-DD.jsonl  
•	Format: The files use the JSON Lines (.jsonl) format, with each line being a standalone JSON object representing one transaction. This format is ideal for processing large log files.  
Example Log Entry:  
JSON  
{"timestamp":"2025-10-02T10:00:00.000Z","requestId":"f47ac10b-58cc-4372-a567-0e02b2c3d479","input":"အေးချမ်းပါစေ","output":"May there be peace","target":"en"}
________________________________________
### Technologies Used  
•	Node.js  
•	Express.js  
•	Axios (for HTTP calls to Google API)  
•	dotenv (for environment variable management)  
•	uuid (for generating unique request IDs)  
•	Google Cloud Translation API (v2)  
________________________________________
### Contributing  
Contributions, issues, and feature requests are welcome!

### License  
This project is licensed under the MIT License. 

"# Flexavior-gct"
