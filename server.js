const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const path = require('path');

// 1. INITIALIZE FIREBASE ADMIN
// Get this file from Firebase Console -> Project Settings -> Service Accounts
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();
const app = express();

require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

app.use(cors());
app.use(express.json());

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/extract-skills', async (req, res) => {
    const { resumeText, domainNames, allSkills } = req.body;

    try {
        const prompt = `
            You are a professional resume parser. 
            Resume Content: ${resumeText}
            Target Domains: ${domainNames.join(', ')}
            Reference Skill List: ${allSkills.join(', ')}

            Task: Extract 10-15 technical and soft skills from the resume. 
            Prioritize skills that appear in the Reference Skill List.
            
            Return ONLY a valid JSON object with the following structure:
            {"skills": ["Skill1", "Skill2", "Skill3"]}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        
        // Clean the response (Gemini sometimes adds markdown code blocks)
        const cleanJson = text.replace(/```json|```/g, "").trim();
        const parsedData = JSON.parse(cleanJson);

        res.json({ skills: parsedData.skills });

    } catch (error) {
        console.error("Gemini Extraction Error:", error);
        res.status(500).json({ error: "Failed to analyze resume with Google AI" });
    }
});
// ═══════════════════════════════════
// API ROUTES
// ═══════════════════════════════════

/**
 * SYNC USER DATA
 * This replaces your local STATE.users logic.
 * Call this after Firebase Login on the frontend.
 */
app.post('/api/sync-user', async (req, res) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decodedToken = await auth.verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const { domains, bookmarks, applications, testHistory } = req.body;

        // Reference to user document
        const userRef = db.collection('users').doc(uid);
        
        // If it's a GET request (initial load), send data back
        if (req.method === 'POST' && Object.keys(req.body).length === 0) {
            const doc = await userRef.get();
            return res.json(doc.exists ? doc.data() : { newUser: true });
        }

        // Otherwise, Save/Update the state
        await userRef.set({
            email: decodedToken.email,
            domains: domains || [],
            bookmarks: bookmarks || [],
            applications: applications || [],
            testHistory: testHistory || [],
            lastActive: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        res.json({ success: true });
    } catch (error) {
        console.error('Error syncing user:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * FETCH INTERNSHIPS
 * Moving your INTERNSHIPS array here makes it easier to update 
 * without redeploying the frontend.
 */
app.get('/api/internships', async (req, res) => {
    // In a real app, you'd fetch this from Firestore. 
    // For now, we return the list from your app.js logic.
    try {
        const snapshot = await db.collection('internships').get();
        const internships = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(internships);
    } catch (e) {
        res.status(500).send("Error fetching internships");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    ═════════════════════════════════════════
    🚀 Resume2Role Server Running
    🔗 http://localhost:${PORT}
    ═════════════════════════════════════════
    `);
});