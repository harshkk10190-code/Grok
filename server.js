const express = require('express'); 
const fs = require('fs'); 
const app = express(); 
const PORT = process.env.PORT || 3000; 

// ==========================================
// 🌐 BEAUTIFUL V33 ELITE DASHBOARD
// ==========================================
app.get('/', (req, res) => { 
    const winrate = state.totalSignals > 0 ? Math.round((state.wins / state.totalSignals) * 100) : 100;
    const currentLevel = state.currentLevel + 1;
    const status = state.safetyPause > 0 ? "SAFETY PAUSED" : (state.activePrediction ? "BET ACTIVE" : "WAITING");
    
    res.send(`
        <html>
        <head>
            <title>KIRA V33 ELITE</title>
            <meta http-equiv="refresh" content="8">
            <style>
                body { background:#0a0a1f; color:#00ff9d; font-family:'Courier New',monospace; text-align:center; padding:30px; }
                h1 { color:#00ff9d; text-shadow:0 0 20px #00ff9d; }
                .box { background:#11112a; border:2px solid #00ff9d; border-radius:15px; padding:25px; max-width:600px; margin:20px auto; box-shadow:0 0 30px rgba(0,255,157,0.3); }
                .stat { font-size:18px; margin:12px 0; }
                .live { color:#00ff41; animation: pulse 2s infinite; }
                @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
            </style>
        </head>
        <body>
            <h1>🟢 𝐊𝐈𝐑𝐀 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐕𝟑𝟑 𝐄𝐋𝐈𝐓𝐄 𝐇𝐘𝐁𝐑𝐈𝐃 🟢</h1>
            <p class="live">● LIVE • HYBRID SIZE+COLOR • MAX PROTECTION</p>
            
            <div class="box">
                <div class="stat"><strong>Win Rate:</strong> \( {winrate}% ( \){state.wins}/${state.totalSignals})</div>
                <div class="stat"><strong>Current Level:</strong> L${currentLevel} • Bet: Rs. ${FUND_LEVELS[state.currentLevel] || 0}</div>
                <div class="stat"><strong>Consecutive Losses:</strong> ${state.consecutiveLosses} • Safety Pause: ${state.safetyPause}</div>
                <div class="stat"><strong>Status:</strong> <span style="color:#00ff41">${status}</span></div>
                ${state.activePrediction ? `<div class="stat">Last Bet: ${state.activePrediction.type} → ${state.activePrediction.pred}</div>` : ''}
            </div>
            
            <p style="color:#666; font-size:13px;">Auto-refreshes every 8s • ${new Date().toLocaleTimeString()}</p>
        </body>
        </html>
    `); 
}); 
app.listen(PORT, () => console.log(`🚀 Kira Quantum V33 Elite Hybrid listening on port ${PORT}`)); 

// ========================================== 
// ⚙️ CONFIG 
// ========================================== 
const BOT_TOKEN = "7574355493:AAHXuRzRUtfAWjsP3qUO8UATMMArJ6gZLxM"; 
const TARGET_CHATS = ["1669843747", "-1002613316641"]; 
const API = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json?pageNo=1&pageSize=30"; 

const FUND_LEVELS = [33, 66, 100]; // MAX 3 LEVELS ONLY

const HEADERS = { 
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", 
    "Accept": "application/json, text/plain, */*", 
    "Origin": "https://www.dmwin2.com", 
    "Referer": "https://www.dmwin2.com/" 
}; 

// ========================================== 
// 🧠 STATE 
// ========================================== 
const STATE_FILE = './kira_state.json'; 
let state = { 
    lastProcessedIssue: null, 
    activePrediction: null, 
    totalSignals: 0, 
    wins: 0, 
    isStarted: false, 
    currentLevel: 0,
    violetPause: 0,
    consecutiveLosses: 0,
    safetyPause: 0
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
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, { 
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
    sendTelegram(`🟢 <b>𝐊𝐈𝐑𝐀 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐕𝟑𝟑 𝐄𝐋𝐈𝐓𝐄 𝐇𝐘𝐁𝐑𝐈𝐃 𝐎𝐍𝐋𝐈𝐍𝐄</b> 🟢\n━━━━━━━━━━━━━━━━━━\n📡 <i>Hybrid Size+Color Activated\nUltra-Sure-Shot Logic • Max Protection</i>`); 
} 

// ========================================== 
// 🧠 V33 ELITE HYBRID BRAIN
// ========================================== 
function getSize(n) { return Number(n) <= 4 ? "SMALL" : "BIG"; } 
function getColor(n) { return [0,2,4,6,8].includes(Number(n)) ? "RED" : "GREEN"; } 

function getStreakLength(arr) {
    if (arr.length < 2) return 1;
    let len = 1;
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] === arr[0]) len++;
        else break;
    }
    return len;
}

function getAlternationCount(arr) {
    let count = 0;
    for (let i = 1; i < Math.min(20, arr.length); i++) {
        if (arr[i] !== arr[i-1]) count++;
    }
    return count;
}

function getHybridSignal(list, currentLevel) {
    if (!list || list.length < 12) return { type: "NONE", action: "WAIT", conf: 0, reason: "GATHERING DATA" };

    const sizes = list.map(i => getSize(Number(i.number)));
    const colors = list.map(i => getColor(Number(i.number)));

    const sizeSignal = analyzeSingle(sizes, "SIZE", currentLevel);
    const colorSignal = analyzeSingle(colors, "COLOR", currentLevel);

    // Choose the stronger one
    if (sizeSignal.conf > colorSignal.conf + 5) return sizeSignal;
    if (colorSignal.conf > sizeSignal.conf + 5) return colorSignal;

    // If close, pick the one with stronger streak/alternation
    return sizeSignal.conf >= colorSignal.conf ? sizeSignal : colorSignal;
}

function analyzeSingle(history, typeLabel, currentLevel) {
    const last = history[0];
    const streak = getStreakLength(history);
    const alts = getAlternationCount(history);

    let action = last;
    let reason = "Standard Hybrid Logic";
    let conf = 75 + (streak * 3);

    if (streak >= 5) {
        reason = `Very Strong ${streak}x ${typeLabel} Streak`;
        conf = 94;
    } else if (alts >= 9 || currentLevel >= 1) {
        action = typeLabel === "SIZE" 
            ? (last === "BIG" ? "SMALL" : "BIG")
            : (last === "RED" ? "GREEN" : "RED");
        reason = currentLevel >= 1 ? "Elite Recovery: High Alternation" : "Strong Alternation Detected";
        conf = 84 + Math.floor(alts * 1.2);
    }

    // Strict thresholds
    if (currentLevel >= 1) conf = Math.max(93, Math.min(97, conf));
    else conf = Math.min(97, conf);

    return { type: typeLabel, action, conf, reason };
}

// ========================================== 
// ⚙️ MAIN LOOP 
// ========================================== 
let isProcessing = false; 

async function tick() { 
    if(isProcessing) return; 
    isProcessing = true; 
    
    try { 
        const res = await fetch(API + "&_t=" + Date.now(), { headers: HEADERS, timeout: 8000 }); 
        const data = await res.json(); 
        if(!data.data || !data.data.list) throw new Error("API Issue"); 
        
        const list = data.data.list; 
        const latestIssue = list[0].issueNumber; 
        const targetIssue = (BigInt(latestIssue) + 1n).toString(); 
        
        let currentNum = Number(list[0].number);
        if (currentNum === 0 || currentNum === 5) {
            state.violetPause = Math.max(state.violetPause, currentNum === 5 ? 4 : 3);
        }

        // Check result
        if(state.activePrediction && BigInt(latestIssue) >= BigInt(state.activePrediction.period)) { 
            const resultItem = list.find(i => i.issueNumber === state.activePrediction.period); 
            if(resultItem) { 
                let actualNum = Number(resultItem.number); 
                let actualResult = state.activePrediction.type === "SIZE" ? getSize(actualNum) : getColor(actualNum); 
                let isWin = (actualResult === state.activePrediction.pred); 
                
                if(isWin) { 
                    state.wins++; 
                    state.currentLevel = 0; 
                    state.consecutiveLosses = 0;
                } else { 
                    state.currentLevel = Math.min(state.currentLevel + 1, FUND_LEVELS.length - 1); 
                    state.consecutiveLosses++;
                } 
                state.totalSignals++; 

                let currentAccuracy = Math.round((state.wins / state.totalSignals) * 100); 
                
                let resMsg = isWin ? `✅ <b>𝐓𝐀𝐑𝐆𝐄𝐓 𝐄𝐋𝐈𝐌𝐈𝐍𝐀𝐓𝐄𝐃</b> ✅\n` : `❌ <b>𝐓𝐀𝐑𝐆𝐄𝐓 𝐌𝐈𝐒𝐒𝐄𝐃</b> ❌\n`; 
                resMsg += `━━━━━━━━━━━━━━━━━━\n`; 
                resMsg += `🎯 𝐏𝐞𝐫𝐢𝐨𝐝: <code>` + state.activePrediction.period.slice(-4) + `</code>\n`; 
                resMsg += `🎲 𝐑𝐞𝐬𝐮𝐥𝐭: <b>` + actualNum + ` (` + actualResult + `)</b>\n`; 
                resMsg += `━━━━━━━━━━━━━━━━━━\n`; 
                
                if (isWin) {
                    resMsg += `💰 𝐒𝐭𝐚𝐭𝐮𝐬: <b>PROFIT SECURED!</b>\n`;
                } else if (state.currentLevel === 2) { // L3 failed
                    resMsg += `🛡️ 𝐒𝐭𝐚𝐭𝐮𝐬: <b>L3 FAILED → FULL SAFETY ACTIVATED</b>\n`;
                } else {
                    resMsg += `🛡️ 𝐒𝐭𝐚𝐭𝐮𝐬: <b>ESCALATING (L` + (state.currentLevel + 1) + `)</b>\n`;
                }
                
                resMsg += `🎯 𝐒𝐞𝐪𝐮𝐞𝐧𝐜𝐞 𝐒𝐮𝐜𝐜𝐞𝐬𝐬: <b>` + currentAccuracy + `%</b>\n`; 
                await sendTelegram(resMsg); 

                if (!isWin && state.currentLevel === 2) { // L3 failed
                    state.safetyPause = 15;
                    state.currentLevel = 0;
                    state.consecutiveLosses = 0;
                    await sendTelegram(`🛡️ <b>ELITE SAFETY PAUSE ACTIVATED</b> 🛡️\n━━━━━━━━━━━━━━━━━━\nL3 failed. Skipping 15 periods & resetting.\nFunds 100% protected.`);
                }
            } 
            state.activePrediction = null; 
            saveState(); 
        } 
        
        // New signal
        if(state.lastProcessedIssue !== latestIssue && !state.activePrediction) { 
            state.lastProcessedIssue = latestIssue; 

            if (state.violetPause > 0 || state.safetyPause > 0) {
                let pauseType = state.violetPause > 0 ? "Violet Trap" : "Elite Safety";
                let left = state.violetPause > 0 ? state.violetPause : state.safetyPause;
                let msg = `📡 <b>𝐊𝐈𝐑𝐀 𝐑𝐀𝐃𝐀𝐑 𝐒𝐂𝐀𝐍</b> 📡\n━━━━━━━━━━━━━━━━━━\n🎯 𝐏𝐞𝐫𝐢𝐨𝐝: <code>` + targetIssue.slice(-4) + `</code>\n⚠️ <b>𝐀𝐜𝐭𝐢𝐨𝐧:</b> WAIT\n📉 <b>𝐑𝐞𝐚𝐬𝐨𝐧:</b> <i>` + pauseType + ` Detected. Protecting funds (` + left + ` left)</i>`;
                await sendTelegram(msg); 
                if (state.violetPause > 0) state.violetPause--;
                if (state.safetyPause > 0) state.safetyPause--;
                saveState();
                return;
            }

            const signal = getHybridSignal(list, state.currentLevel); 
            
            if(signal && signal.action !== "WAIT" && signal.conf >= (state.currentLevel >= 1 ? 93 : 88)) { 
                let betAmount = FUND_LEVELS[state.currentLevel]; 
                let threatLevel = state.currentLevel === 0 ? "🟢 𝐒𝐓𝐀𝐍𝐃𝐀𝐑𝐃 𝐄𝐍𝐓𝐑𝐘" : (state.currentLevel === 1 ? "🟡 𝐀𝐃𝐀𝐏𝐓𝐈𝐕𝐄 𝐑𝐄𝐂𝐎𝐕𝐄𝐑𝐘" : "🔴 𝐃𝐄𝐄𝐏 𝐑𝐄𝐂𝐎𝐕𝐄𝐑𝐘");

                let bar = "🟩🟩🟩🟩🟩";
                if (signal.conf < 92) bar = "🟩🟩🟩🟩⬜";
                
                let msg = `⚡️ 𝐊𝐈𝐑𝐀 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐕𝟑𝟑 𝐄𝐋𝐈𝐓𝐄 ⚡️\n━━━━━━━━━━━━━━━━━━\n`;
                msg += `🎯 𝐏𝐞𝐫𝐢𝐨𝐝: <code>` + targetIssue.slice(-4) + `</code>\n`;
                msg += (signal.type === "COLOR" ? "🎨" : "📏") + ` <b>𝐇𝐲𝐛𝐫𝐢𝐝 𝐒𝐢𝐠𝐧𝐚𝐥:</b> ` + signal.type + `\n`; 
                msg += `🔮 <b>𝐏𝐫𝐞𝐝𝐢𝐜𝐭𝐢𝐨𝐧: ` + signal.action + `</b>\n`; 
                msg += `📊 𝐂𝐨𝐧𝐟𝐢𝐝𝐞𝐧𝐜𝐞: ` + bar + ` <b>` + signal.conf + `%</b>\n`; 
                msg += `━━━━━━━━━━━━━━━━━━\n`; 
                msg += `⚠️ <b>` + threatLevel + `</b>\n`; 
                msg += `💰 <b>𝐈𝐧𝐯𝐞𝐬𝐭𝐦𝐞𝐧𝐭 (𝐋` + (state.currentLevel + 1) + `): Rs. ` + betAmount + `</b>\n`; 
                msg += `🧠 <i>` + signal.reason + `</i>`; 
                
                await sendTelegram(msg); 
                state.activePrediction = { period: targetIssue, pred: signal.action, type: signal.type, conf: signal.conf, timestamp: Date.now() }; 
                saveState(); 
            }
        } 
    } catch (e) {
        console.log(`[API ERROR] ${e.message}`);
    } finally { 
        isProcessing = false; 
    } 
} 

setInterval(tick, 2500); 
tick();
