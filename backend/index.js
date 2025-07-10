const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

const dbPath = path.join(__dirname, 'db.json');

// Function to read from the database safely
const readDb = () => {
  try {
    if (!fs.existsSync(dbPath)) {
      // If file doesn't exist, create it with a default structure
      fs.writeFileSync(dbPath, JSON.stringify({ commits: [] }, null, 2));
      return { commits: [] };
    }
    
    const data = fs.readFileSync(dbPath, 'utf-8');
    // If file is empty, return default structure
    if (data.trim() === '') {
      return { commits: [] };
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading or parsing db.json:", error);
    // On any error, return a safe, default structure
    return { commits: [] };
  }
};

// Function to write to the database safely
const writeDb = (data) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing to db.json:", error);
  }
};

// Webhook endpoint to receive data from GitHub
app.post('/api/webhook', (req, res) => {
  try {
    const { body } = req;
    console.log('Received webhook payload:', JSON.stringify(body, null, 2));

    if (body.commits && Array.isArray(body.commits)) {
      const db = readDb();
      
      body.commits.forEach(commit => {
        const bountyIdMatch = commit.message.match(/#(\d+)/);
        if (bountyIdMatch) {
          const bountyId = bountyIdMatch[1];
          const githubUser = commit.author.username || commit.author.name;

          // --- New Logic: Map GitHub user to Wallet Address ---
          const userMappingPath = path.join(__dirname, 'user-mapping.json');
          let walletAddress = null;
          if (fs.existsSync(userMappingPath)) {
            const userMapping = JSON.parse(fs.readFileSync(userMappingPath, 'utf-8'));
            walletAddress = userMapping[githubUser];
          }
          // -----------------------------------------------------

          if (walletAddress) {
            const newCommit = {
              bountyId: bountyId,
              eventName: 'COMMIT',
              address: walletAddress, // Store wallet address instead of userName
              prLink: commit.url,
              commitId: commit.id,
              timestamp: commit.timestamp
            };

            if (!Array.isArray(db.commits)) {
              db.commits = [];
            }
            db.commits.push(newCommit);
          } else {
            console.log(`Commit from user ${githubUser} ignored: no wallet mapping found.`);
          }
        }
      });

      writeDb(db);
    }

    res.status(200).send('Payload received');
  } catch (error) {
    console.error('Error in webhook handler:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint for the frontend to fetch committers
app.get('/api/bounties/:bountyId/committers', (req, res) => {
  try {
    const { bountyId } = req.params;
    const db = readDb();
    
    // Ensure db.commits exists before filtering
    const commits = (db && Array.isArray(db.commits)) ? db.commits : [];
    const committers = commits.filter(c => c.bountyId === bountyId);
    
    res.json(committers);
  } catch (error) {
    console.error(`Error in /api/bounties/:bountyId/committers:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
