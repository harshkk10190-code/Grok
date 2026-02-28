const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 🌐 WEB MONITOR 
// ==========================================
app.get('/', (req, res) => {
    res.send(`
        <body style="background:#050510; color:#00ff9d; font-family:monospace; text-align:center; padding:50px;">
            <h2>🧠 𝐉𝐀𝐑𝐕𝐈𝐒 🤖 𝐀𝐈 𝐏𝐑𝐄𝐃𝐈𝐂𝐓𝐎𝐑 𝐎𝐍𝐋𝐈𝐍𝐄 🧠</h2>
            <p>Dual-Scan Neural Network connected to WinGo live data stream.</p>
        </body>
    `);
});
app.listen(PORT, () => console.log(`🚀 JᴀʀᴠᎥຮ AI Predictor Server listening on port ${PORT}`));

// ==========================================
// ⚙️ CONFIGURATION
// ==========================================
const TELEGRAM_BOT_TOKEN = "7574355493:AAHk8TOKpsbR23OhDr7gtqaLBNFZlhpSlxs"; 
const TARGET_CHATS = ["1669843747", "-1002613316641"];
const GEMINI_API_KEY = "AIzaSyB_MiGFRKNS_0bL-gXCp6deGAkkcTzDobs"; 
const WINGO_API = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json?pageNo=1&pageSize=30";

const FUND_LEVELS = [33, 66, 130, 260, 550, 1100]; // 6 Level Safety Net

const HEADERS = { 
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", 
    "Accept": "application/json, text/plain, */*", 
    "Origin": "https://www.dmwin2.com", 
    "Referer": "https://www.dmwin2.com/" 
}; 

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ==========================================
// 🧠 MEMORY & STATE
// ==========================================
const STATE_FILE = './jarvis_state.json'; 
let state = { 
    lastProcessedIssue: null, 
    activePrediction: null, 
    totalSignals: 0, 
    wins: 0, 
    isStarted: false, 
    currentLevel: 0
}; 

function loadState() { 
    if (fs.existsSync(STATE_FILE)) { 
        try { state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } 
        catch(e) { console.log("Memory reset."); } 
    } 
} 
function saveState() { fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2)); } 
loadState(); 

async function sendTelegram(text) { 
    for (let chat_id of TARGET_CHATS) { 
        try { 
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ chat_id: chat_id, text: text, parse_mode: 'HTML' }) 
            }); 
        } catch(e) {} 
    } 
} 

if (!state.isStarted) { 
    state.isStarted = true; 
    saveState(); 
    let bootMsg = `🤖 <b>𝐉𝐀𝐑𝐕𝐈𝐒 𝐀𝐈 𝐒𝐘𝐒𝐓𝐄𝐌 𝐎𝐍𝐋𝐈𝐍𝐄</b> 🤖\n⟡ ════════ ⋆★⋆ ════════ ⟡\n\n🧠 <i>Dual-Scan Neural Network Linked.</i>\n⚡ <i>Evaluating Color vs. Size logic.</i>\n\n⟡ ════════ ⋆★⋆ ════════ ⟡`; 
    sendTelegram(bootMsg); 
} 

// ==========================================
// 🤖 GEMINI AI PREDICTION ENGINE
// ==========================================
async function getAIPrediction(historyList) {
    try {
        // Format the last 20 results for the AI
        let historyString = historyList.slice(0, 20).map(i => {
            let num = Number(i.number);
            let size = num <= 4 ? "SMALL" : "BIG";
            let color = [0,2,4,6,8].includes(num) ? "RED" : "GREEN";
            return `Num: ${num}, Size: ${size}, Color: ${color}`;
        }).join(" | ");

        // 🧠 THE ULTIMATE PROMPT (Makes the AI actually think)
        const prompt = `
        You are JᴀʀᴠᎥຮ, an elite predictive neural network analyzing a 1-minute casino market.
        
        Here are the last 20 results (Newest to Oldest):
        ${historyString}

        YOUR MISSION:
        1. Evaluate the 'SIZE' pattern (BIG/SMALL).
        2. Evaluate the 'COLOR' pattern (RED/GREEN).
        3. Compare them. Which trend is mathematically and logically STRONGER right now? 
        4. If both are noisy, chaotic, or a 0/5 recently disrupted the board, you MUST output WAIT to protect the capital.

        Respond STRICTLY in valid JSON format exactly like this, with no markdown formatting or extra words:
        {"type": "SIZE or COLOR or NONE", "action": "BIG or SMALL or RED or GREEN or WAIT", "confidence": <number between 85 and 99>, "reason": "<A highly analytical, 5 to 8 word explanation of why you chose this exact outcome>"}
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        let aiText = result.response.text().trim();
        
        // Clean JSON from Gemini markdown wrappers
        if(aiText.startsWith('```json')) { aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim(); }
        if(aiText.startsWith('```')) { aiText = aiText.replace(/```/g, '').trim(); }

        const decision = JSON.parse(aiText);
        return decision;

    } catch (error) {
        console.log("Gemini AI Error:", error.message);
        return { type: "NONE", action: "WAIT", confidence: 0, reason: "Neural Network calculating probabilities..." };
    }
}

// ========================================== 
// ⚙️ SERVER MAIN LOOP 
// ========================================== 
let isProcessing = false; 

function getSize(n) { return n <= 4 ? "SMALL" : "BIG"; } 
function getColor(n) { return [0,2,4,6,8].includes(n) ? "RED" : "GREEN"; } 

async function tick() { 
    if(isProcessing) return; 
    isProcessing = true; 
    
    try { 
        const res = await fetch(WINGO_API + "&_t=" + Date.now(), { headers: HEADERS, timeout: 8000 }); 
        const data = await res.json(); 
        if(!data.data || !data.data.list) throw new Error("API Issue"); 
        
        const list = data.data.list; 
        const latestIssue = list[0].issueNumber; 
        const targetIssue = (BigInt(latestIssue) + 1n).toString(); 
        
        if(state.activePrediction && BigInt(latestIssue) >= BigInt(state.activePrediction.period) + 2n) { 
            state.activePrediction = null; saveState(); 
        } 
        
        // 1️⃣ CHECK PREVIOUS RESULT 
        if(state.activePrediction) { 
            let timeElapsed = Date.now() - state.activePrediction.timestamp;
            if (timeElapsed > 4 * 60 * 1000) { 
                state.activePrediction = null; saveState();
                return;
            }

            if(BigInt(latestIssue) >= BigInt(state.activePrediction.period)) { 
                const resultItem = list.find(i => i.issueNumber === state.activePrediction.period); 
                if(resultItem) { 
                    let actualNum = Number(resultItem.number); 
                    let actualResult = state.activePrediction.type === "SIZE" ? getSize(actualNum) : getColor(actualNum); 
                    let isWin = (actualResult === state.activePrediction.pred); 
                    
                    if(isWin) { 
                        state.wins++; 
                        state.totalSignals++; 
                        state.currentLevel = 0; 
                    } else { 
                        state.currentLevel++; 
                        if(state.currentLevel >= FUND_LEVELS.length) {
                            state.totalSignals++; 
                            state.currentLevel = 0; 
                            await sendTelegram(`🛑 <b>𝐌𝐀𝐗 𝐋𝐄𝐕𝐄𝐋 𝐑𝐄𝐀𝐂𝐇𝐄𝐃</b> 🛑\n⚠️ AI detected massive anomaly. Resetting.`);
                        }
                    } 
                    
                    let currentAccuracy = state.totalSignals > 0 ? Math.round((state.wins / state.totalSignals) * 100) : 100; 
                    
                    let resMsg = isWin ? `✅ <b>𝐀𝐈 𝐓𝐀𝐑𝐆𝐄𝐓 𝐄𝐋𝐈𝐌𝐈𝐍𝐀𝐓𝐄𝐃</b> ✅\n` : `❌ <b>𝐀𝐈 𝐓𝐀𝐑𝐆𝐄𝐓 𝐌𝐈𝐒𝐒𝐄𝐃</b> ❌\n`; 
                    resMsg += `⟡ ════════ ⋆★⋆ ════════ ⟡\n`; 
                    resMsg += `🎯 <b>𝐏𝐞𝐫𝐢𝐨𝐝 :</b> <code>${state.activePrediction.period.slice(-4)}</code>\n`; 
                    resMsg += `🎲 <b>𝐑𝐞𝐬𝐮𝐥𝐭 :</b> ${actualNum} (${actualResult})\n`; 
                    
                    if(isWin) {
                        resMsg += `💎 <b>𝐏𝐫𝐨𝐟𝐢𝐭 :</b> 𝐒𝐄𝐂𝐔𝐑𝐄𝐃\n`; 
                    } else {
                        resMsg += `🛡️ <b>𝐒𝐭𝐚𝐭𝐮𝐬 :</b> 𝐄𝐒𝐂𝐀𝐋𝐀𝐓𝐈𝐍𝐆 (𝐋𝐞𝐯𝐞𝐥 ${state.currentLevel + 1})\n`; 
                    }
                    resMsg += `📊 <b>𝐀𝐈 𝐀𝐜𝐜𝐮𝐫𝐚𝐜𝐲:</b> ${currentAccuracy}%\n`;
                    resMsg += `⟡ ════════ ⋆★⋆ ════════ ⟡\n`; 
                    
                    await sendTelegram(resMsg); 
                } 
                state.activePrediction = null; saveState(); 
            } 
        } 
        
        // 2️⃣ GENERATE NEW PREDICTION USING GEMINI
        if(state.lastProcessedIssue !== latestIssue) { 
            if(!state.activePrediction) { 

                // Send data to Gemini API
                const signal = await getAIPrediction(list);
                
                if(signal && signal.action === "WAIT") { 
                    let msg = `📡 <b>𝐉𝐀𝐑𝐕𝐈𝐒 𝐍𝐄𝐔𝐑𝐀𝐋 𝐒𝐂𝐀𝐍</b> 📡\n`; 
                    msg += `⟡ ═════ ⋆★⋆ ═════ ⟡\n`; 
                    msg += `🎯 𝐏𝐞𝐫𝐢𝐨𝐝: <code>${targetIssue.slice(-4)}</code>\n`; 
                    msg += `⚠️ <b>𝐀𝐜𝐭𝐢𝐨𝐧:</b> WAIT\n`; 
                    msg += `🧠 <b>𝐀𝐈 𝐋𝐨𝐠𝐢𝐜:</b> <i>${signal.reason}</i>`;
                    await sendTelegram(msg); 
                    saveState();
                } else if(signal && signal.action !== "WAIT") { 
                    let signalEmoji = signal.type === "COLOR" ? "🎨" : "📏"; 
                    let betAmount = FUND_LEVELS[state.currentLevel]; 

                    let bar = "🟩🟩🟩🟩🟩";
                    if (signal.confidence < 92) bar = "🟩🟩🟩🟩⬜";
                    
                    let msg = `🤖 <b>𝐉𝐀𝐑𝐕𝐈𝐒 𝐀𝐈 : 𝐀𝐍𝐀𝐋𝐘𝐒𝐈𝐒</b> 🤖\n`; 
                    msg += `⟡ ════════ ⋆★⋆ ════════ ⟡\n`; 
                    msg += `🎯 <b>𝐓𝐚𝐫𝐠𝐞𝐭 𝐏𝐞𝐫𝐢𝐨𝐝 :</b> <code>${targetIssue.slice(-4)}</code>\n`; 
                    msg += `🔍 <b>𝐀𝐧𝐨𝐦𝐚𝐥𝐲 𝐓𝐲𝐩𝐞 :</b> ${signalEmoji} ${signal.type}\n`; 
                    msg += `🔮 <b>𝐀𝐈 𝐏𝐫𝐞𝐝𝐢𝐜𝐭𝐢𝐨𝐧 : ${signal.action}</b>\n`; 
                    msg += `📊 <b>𝐂𝐨𝐧𝐟𝐢𝐝𝐞𝐧𝐜𝐞    :</b> ${bar} <b>${signal.confidence}%</b>\n`; 
                    msg += `⟡ ════════ ⋆★⋆ ════════ ⟡\n`; 
                    msg += `💎 <b>𝐄𝐧𝐭𝐫𝐲 𝐋𝐞𝐯𝐞𝐥  :</b> Level ${state.currentLevel + 1}\n`; 
                    msg += `💰 <b>𝐈𝐧𝐯𝐞𝐬𝐭𝐦𝐞𝐧𝐭   :</b> Rs. ${betAmount}\n`; 
                    msg += `🧠 <b>𝐀𝐈 𝐑𝐞𝐚𝐬𝐨𝐧𝐢𝐧𝐠 :</b> <i>${signal.reason}</i>`; 
                    
                    await sendTelegram(msg); 
                    state.activePrediction = { period: targetIssue, pred: signal.action, type: signal.type, conf: signal.confidence, timestamp: Date.now() }; 
                    saveState(); 
                } 
            } 
            state.lastProcessedIssue = latestIssue; saveState(); 
        } 
    } catch (e) {
        console.log(`[API ERROR] ${e.message}`);
    } finally { 
        isProcessing = false; 
    } 
} 

setInterval(tick, 2500); 
tick();
