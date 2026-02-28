const express = require('express');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 🌐 WEB MONITOR 
// ==========================================
app.get('/', (req, res) => {
    res.send(`
        <body style="background:#050510; color:#00ff9d; font-family:monospace; text-align:center; padding:50px;">
            <h2>🧠 𝐉𝐀𝐑𝐕𝐈𝐒 🤖 𝐀𝐈 𝐏𝐑𝐄𝐃𝐈𝐂𝐓𝐎𝐑 (𝐒𝐄𝐂𝐔𝐑𝐄 𝐌𝐎𝐃𝐄) 🧠</h2>
            <p>Environment Variables Locked. AI Active.</p>
        </body>
    `);
});
app.listen(PORT, () => console.log(`🚀 JᴀʀᴠᎥຮ AI Predictor Server listening on port ${PORT}`));

// ==========================================
// ⚙️ CONFIGURATION
// ==========================================
const TELEGRAM_BOT_TOKEN = "7574355493:AAF873XoLn6sUaSrpjMmhd1alhremmObKXA"; 
const TARGET_CHATS = ["1669843747", "-1002613316641"];

// 🔒 THE VAULT: Pulling the key safely from Render
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

const WINGO_API = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json?pageNo=1&pageSize=30";
const FUND_LEVELS = [33, 66, 130, 260, 550, 1100]; 

// 🛡️ Mobile Browser Spoofing
const HEADERS = { 
    "User-Agent": "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36", 
    "Accept": "application/json, text/plain, */*", 
    "Origin": "https://www.dmwin2.com", 
    "Referer": "https://www.dmwin2.com/",
    "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
    "Connection": "keep-alive"
}; 

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
    currentLevel: 0,
    waitCount: 0 
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
    let bootMsg = `🤖 <b>𝐉𝐀𝐑𝐕𝐈𝐒 𝐀𝐈 𝐒𝐘𝐒𝐓𝐄𝐌 𝐎𝐍𝐋𝐈𝐍𝐄</b> 🤖\n⟡ ════════ ⋆★⋆ ════════ ⟡\n\n🧠 <i>Raw API Connection Linked.</i>\n🔒 <i>Vault Security Engaged.</i>\n\n⟡ ════════ ⋆★⋆ ════════ ⟡`; 
    sendTelegram(bootMsg); 
} 

// ==========================================
// 🤖 RAW GEMINI API PREDICTION ENGINE
// ==========================================
async function getAIPrediction(historyList) {
    if (!GEMINI_API_KEY) {
        return { type: "NONE", action: "WAIT", confidence: 0, reason: "ERR: Missing API Key in Render Environment!" };
    }

    try {
        let historyString = historyList.slice(0, 20).map(i => {
            let num = Number(i.number);
            let size = num <= 4 ? "SMALL" : "BIG";
            let color = [0,2,4,6,8].includes(num) ? "RED" : "GREEN";
            return `N:${num}, S:${size}, C:${color}`;
        }).join(" | ");

        const prompt = `
        Analyze this sequential data stream to predict the next logical output based on alternating patterns and momentum.
        
        Data History (Newest to Oldest):
        ${historyString}

        Task:
        1. Evaluate the 'Size' pattern (BIG vs SMALL).
        2. Evaluate the 'Color' pattern (RED vs GREEN).
        3. Determine which of the two patterns is mathematically stronger.
        4. If no clear pattern exists, output WAIT.

        Respond ONLY with a valid JSON object. No markdown, no code blocks, no other text.
        {"type": "SIZE or COLOR or NONE", "action": "BIG or SMALL or RED or GREEN or WAIT", "confidence": 95, "reason": "Short 5 word reason"}
        `;

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            let realError = data.error?.message || "Unknown Google Error";
            console.log("\n[RAW GOOGLE ERROR]:", JSON.stringify(data, null, 2));
            throw new Error(realError);
        }

        let aiText = data.candidates[0].content.parts[0].text.trim();
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        } else {
            throw new Error("Invalid Output Format from AI");
        }

    } catch (error) {
        console.log("Gemini API Error:", error.message);
        let cleanError = error.message.replace(/[\n\r]/g, " ").substring(0, 100); 
        return { type: "NONE", action: "WAIT", confidence: 0, reason: `ERR: ${cleanError}` };
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
        
        const rawText = await res.text();
        let data;
        
        try {
            data = JSON.parse(rawText);
        } catch (parseError) {
            console.log(`\n[FIREWALL BLOCKED] The casino returned a security page instead of JSON.`);
            throw new Error("Casino Firewall Blocked Connection.");
        }

        if(!data.data || !data.data.list) throw new Error("Empty API List"); 
        
        const list = data.data.list; 
        const latestIssue = list[0].issueNumber; 
        const targetIssue = (BigInt(latestIssue) + 1n).toString(); 
        
        if(state.activePrediction && BigInt(latestIssue) >= BigInt(state.activePrediction.period) + 2n) { 
            state.activePrediction = null; saveState(); 
        } 
        
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
        
        if(state.lastProcessedIssue !== latestIssue) { 
            if(!state.activePrediction) { 

                const signal = await getAIPrediction(list);
                
                console.log(`\n[${new Date().toLocaleTimeString()}] 🎯 Period ${targetIssue.slice(-4)} | AI DECISION:`, signal);
                
                if(signal && signal.action === "WAIT") { 
                    state.waitCount++;
                    if (state.waitCount === 1 || state.waitCount % 15 === 0) {
                        let msg = `📡 <b>𝐉𝐀𝐑𝐕𝐈𝐒 𝐍𝐄𝐔𝐑𝐀𝐋 𝐒𝐂𝐀𝐍</b> 📡\n`; 
                        msg += `⟡ ═════ ⋆★⋆ ═════ ⟡\n`; 
                        msg += `🎯 𝐏𝐞𝐫𝐢𝐨𝐝: <code>${targetIssue.slice(-4)}</code>\n`; 
                        msg += `⚠️ <b>𝐀𝐜𝐭𝐢𝐨𝐧:</b> WAIT\n`; 
                        msg += `🧠 <b>𝐀𝐈 𝐋𝐨𝐠𝐢𝐜:</b> <i>${signal.reason}</i>\n`;
                        msg += `🔇 <i>(Silencing further scans to prevent spam)</i>`;
                        await sendTelegram(msg); 
                    }
                    saveState();
                } else if(signal && signal.action !== "WAIT") { 
                    state.waitCount = 0; 
                    
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
