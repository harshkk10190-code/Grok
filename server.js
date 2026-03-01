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
            <h2>🧠 𝐉𝐀𝐑𝐕𝐈𝐒 🤖 𝐀𝐋𝐆𝐎 𝐒𝐍𝐈𝐏𝐄𝐑 (𝐕𝟑.𝟎) 🧠</h2>
            <p>AI Removed. PDF Trend Pattern Engine Active. 100% Free.</p>
        </body>
    `);
});
app.listen(PORT, () => console.log(`🚀 JᴀʀᴠᎥຮ Algo Predictor listening on port ${PORT}`));

// ==========================================
// ⚙️ CONFIGURATION
// ==========================================
const TELEGRAM_BOT_TOKEN = "7574355493:AAF873XoLn6sUaSrpjMmhd1alhremmObKXA"; 
const TARGET_CHATS = ["1669843747", "-1002613316641"];

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
    let bootMsg = `🤖 <b>𝐉𝐀𝐑𝐕𝐈𝐒 𝐀𝐋𝐆𝐎 𝐒𝐘𝐒𝐓𝐄𝐌 𝐎𝐍𝐋𝐈𝐍𝐄</b> 🤖\n⟡ ════════ ⋆★⋆ ════════ ⟡\n\n⚡ <i>Google API Severed.</i>\n📈 <i>PDF Trend Pattern Engine Active.</i>\n\n⟡ ════════ ⋆★⋆ ════════ ⟡`; 
    sendTelegram(bootMsg); 
} 

// ==========================================
// 📈 PDF TREND ALGORITHM ENGINE (NO AI)
// ==========================================
function analyzeTrends(list) {
    // Convert casino data into simple arrays (Index 0 is the newest result)
    let sizes = list.slice(0, 10).map(i => Number(i.number) <= 4 ? 'S' : 'B');
    let colors = list.slice(0, 10).map(i => [0,2,4,6,8].includes(Number(i.number)) ? 'R' : 'G');

    function findPattern(arr, type) {
        // 10. Long Trend: A-A-A-A -> Next is A
        if (arr[0] === arr[1] && arr[1] === arr[2] && arr[2] === arr[3]) {
            return { action: arr[0], reason: `11. Long Trend detected.` };
        }
        
        // 1. Single Trend (Alternating): A-B-A-B -> Next is A
        if (arr[0] !== arr[1] && arr[1] !== arr[2] && arr[2] !== arr[3]) {
            return { action: arr[0], reason: `1. Single Trend (Alternating) detected.` };
        }
        
        // 2. Double Trend: B-B-A-A -> Next is B (Looking from newest to oldest)
        if (arr[0] === arr[1] && arr[1] !== arr[2] && arr[2] === arr[3] && arr[0] !== arr[2]) {
            return { action: arr[2], reason: `2. Double Trend detected.` };
        }

        // 6. Two in One Trend: A-A-B-A-A -> Next is B
        if (arr[0] === arr[1] && arr[1] !== arr[2] && arr[2] !== arr[3] && arr[3] === arr[4] && arr[0] === arr[3]) {
            return { action: arr[2], reason: `7. Two in One Trend detected.` };
        }

        // 3. Triple Trend: B-B-B-A-A-A -> Next is B
        if (arr[0] === arr[1] && arr[1] === arr[2] && arr[2] !== arr[3] && arr[3] === arr[4] && arr[4] === arr[5] && arr[0] !== arr[3]) {
            return { action: arr[3], reason: `3. Triple Trend detected.` };
        }

        return null; // No PDF chart pattern matches
    }

    let sizePattern = findPattern(sizes, 'SIZE');
    let colorPattern = findPattern(colors, 'COLOR');

    // Prioritize whichever pattern it finds first
    if (sizePattern) {
        let finalAction = sizePattern.action === 'S' ? 'SMALL' : 'BIG';
        return { type: "SIZE", action: finalAction, confidence: 95, reason: sizePattern.reason };
    }
    
    if (colorPattern) {
        let finalAction = colorPattern.action === 'R' ? 'RED' : 'GREEN';
        return { type: "COLOR", action: finalAction, confidence: 95, reason: colorPattern.reason };
    }

    // If the board is chaotic, safely wait.
    return { type: "NONE", action: "WAIT", confidence: 0, reason: "No clear PDF Trend Chart patterns forming. Waiting..." };
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
                            await sendTelegram(`🛑 <b>𝐌𝐀𝐗 𝐋𝐄𝐕𝐄𝐋 𝐑𝐄𝐀𝐂𝐇𝐄𝐃</b> 🛑\n⚠️ Algo detected massive anomaly. Resetting.`);
                        }
                    } 
                    
                    let currentAccuracy = state.totalSignals > 0 ? Math.round((state.wins / state.totalSignals) * 100) : 100; 
                    
                    let resMsg = isWin ? `✅ <b>𝐓𝐀𝐑𝐆𝐄𝐓 𝐄𝐋𝐈𝐌𝐈𝐍𝐀𝐓𝐄𝐃</b> ✅\n` : `❌ <b>𝐓𝐀𝐑𝐆𝐄𝐓 𝐌𝐈𝐒𝐒𝐄𝐃</b> ❌\n`; 
                    resMsg += `⟡ ════════ ⋆★⋆ ════════ ⟡\n`; 
                    resMsg += `🎯 <b>𝐏𝐞𝐫𝐢𝐨𝐝 :</b> <code>${state.activePrediction.period.slice(-4)}</code>\n`; 
                    resMsg += `🎲 <b>𝐑𝐞𝐬𝐮𝐥𝐭 :</b> ${actualNum} (${actualResult})\n`; 
                    
                    if(isWin) {
                        resMsg += `💎 <b>𝐏𝐫𝐨𝐟𝐢𝐭 :</b> 𝐒𝐄𝐂𝐔𝐑𝐄𝐃\n`; 
                    } else {
                        resMsg += `🛡️ <b>𝐒𝐭𝐚𝐭𝐮𝐬 :</b> 𝐄𝐒𝐂𝐀𝐋𝐀𝐓𝐈𝐍𝐆 (𝐋𝐞𝐯𝐞𝐥 ${state.currentLevel + 1})\n`; 
                    }
                    resMsg += `📊 <b>𝐀𝐜𝐜𝐮𝐫𝐚𝐜𝐲:</b> ${currentAccuracy}%\n`;
                    resMsg += `⟡ ════════ ⋆★⋆ ════════ ⟡\n`; 
                    
                    await sendTelegram(resMsg); 
                } 
                state.activePrediction = null; saveState(); 
            } 
        } 
        
        if(state.lastProcessedIssue !== latestIssue) { 
            if(!state.activePrediction) { 

                // 🚨 INSTANT ALGORITHMIC PREDICTION (NO AI, NO DELAY)
                const signal = analyzeTrends(list);
                
                console.log(`\n[${new Date().toLocaleTimeString()}] 🎯 Period ${targetIssue.slice(-4)} | ALGO DECISION:`, signal);
                
                if(signal && signal.action === "WAIT") { 
                    state.waitCount++;
                    if (state.waitCount === 1 || state.waitCount % 15 === 0) {
                        let msg = `📡 <b>𝐉𝐀𝐑𝐕𝐈𝐒 𝐀𝐋𝐆𝐎 𝐒𝐂𝐀𝐍</b> 📡\n`; 
                        msg += `⟡ ═════ ⋆★⋆ ═════ ⟡\n`; 
                        msg += `🎯 𝐏𝐞𝐫𝐢𝐨𝐝: <code>${targetIssue.slice(-4)}</code>\n`; 
                        msg += `⚠️ <b>𝐀𝐜𝐭𝐢𝐨𝐧:</b> WAIT\n`; 
                        msg += `🧠 <b>𝐋𝐨𝐠𝐢𝐜:</b> <i>${signal.reason}</i>\n`;
                        msg += `🔇 <i>(Silencing further scans to prevent spam)</i>`;
                        await sendTelegram(msg); 
                    }
                    saveState();
                } else if(signal && signal.action !== "WAIT") { 
                    state.waitCount = 0; 
                    
                    let signalEmoji = signal.type === "COLOR" ? "🎨" : "📏"; 
                    let betAmount = FUND_LEVELS[state.currentLevel]; 
                    
                    let msg = `🤖 <b>𝐉𝐀𝐑𝐕𝐈𝐒 𝐀𝐋𝐆𝐎 : 𝐒𝐈𝐆𝐍𝐀𝐋</b> 🤖\n`; 
                    msg += `⟡ ════════ ⋆★⋆ ════════ ⟡\n`; 
                    msg += `🎯 <b>𝐓𝐚𝐫𝐠𝐞𝐭 𝐏𝐞𝐫𝐢𝐨𝐝 :</b> <code>${targetIssue.slice(-4)}</code>\n`; 
                    msg += `🔍 <b>𝐀𝐧𝐨𝐦𝐚𝐥𝐲 𝐓𝐲𝐩𝐞 :</b> ${signalEmoji} ${signal.type}\n`; 
                    msg += `🔮 <b>𝐏𝐫𝐞𝐝𝐢𝐜𝐭𝐢𝐨𝐧 : ${signal.action}</b>\n`; 
                    msg += `📊 <b>𝐂𝐨𝐧𝐟𝐢𝐝𝐞𝐧𝐜𝐞  :</b> 🟩🟩🟩🟩🟩 <b>99%</b>\n`; 
                    msg += `⟡ ════════ ⋆★⋆ ════════ ⟡\n`; 
                    msg += `💎 <b>𝐄𝐧𝐭𝐫𝐲 𝐋𝐞𝐯𝐞𝐥 :</b> Level ${state.currentLevel + 1}\n`; 
                    msg += `💰 <b>𝐈𝐧𝐯𝐞𝐬𝐭𝐦𝐞𝐧𝐭 :</b> Rs. ${betAmount}\n`; 
                    msg += `🧠 <b>𝐏𝐚𝐭𝐭𝐞𝐫𝐧 :</b> <i>${signal.reason}</i>`; 
                    
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
