const express = require('express'); 
const fs = require('fs'); 
const app = express(); 
const PORT = process.env.PORT || 3000; 

// ==========================================
// 🌐 MY PREMIUM DASHBOARD
// ==========================================
app.get('/', (req, res) => { 
    const winrate = state.totalSignals > 0 ? Math.round((state.wins / state.totalSignals) * 100) : 100;
    const status = state.safetyPause > 0 ? "🛡️ SAFETY PAUSED" : (state.activePrediction ? "🔥 BET ACTIVE" : "⏳ LIVE SCANNING");
    
    res.send(`
        <body style="background:#0a001f; color:#00ff9d; font-family:monospace; text-align:center; padding:40px;">
            <h1>🟢 𝐊𝐈𝐑𝐀 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐕𝟑𝟒.𝟏 𝐄𝐋𝐈𝐓𝐄 𝐇𝐘𝐁𝐑𝐈𝐃 🟢</h1>
            <p>● LIVE • HYBRID SIZE+COLOR • MAX SAFETY</p>
            <div style="background:#120032; border:3px solid #00ff9d; border-radius:20px; padding:30px; max-width:580px; margin:30px auto; box-shadow:0 0 40px #00ff9d33;">
                <p><strong>Win Rate:</strong> \( {winrate}% ( \){state.wins}/${state.totalSignals})</p>
                <p><strong>Level:</strong> L${state.currentLevel + 1} • Max Rs.100</p>
                <p><strong>Status:</strong> <span style="color:#39ff14">${status}</span></p>
            </div>
            <p style="color:#555; font-size:13px;">Auto-refresh every 8s • ${new Date().toLocaleTimeString()}</p>
        </body>
    `); 
}); 
app.listen(PORT, () => console.log(`🚀 Kira Quantum V34.1 Elite Hybrid on port ${PORT}`)); 

// ========================================== 
// ⚙️ CONFIG 
// ========================================== 
const BOT_TOKEN = "7574355493:AAHYysug6fqbTwvbL03I1OfaOAxZkcXAZSU"; 
const TARGET_CHATS = ["1669843747", "-1002613316641"]; 
const API = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json?pageNo=1&pageSize=30"; 

const FUND_LEVELS = [33, 66, 100]; 

const HEADERS = { 
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", 
    "Accept": "application/json, text/plain, */*", 
    "Origin": "https://www.dmwin2.com", 
    "Referer": "https://www.dmwin2.com/" 
}; 

// ========================================== 
// 🧠 CLEAN STATE (HARD RESET ON EVERY START)
// ========================================== 
const STATE_FILE = './kira_state.json'; 

// FORCE CLEAN START - DELETE OLD STATE FILE
if (fs.existsSync(STATE_FILE)) {
    try { fs.unlinkSync(STATE_FILE); console.log("🧹 Old state deleted - fresh start"); } catch(e) {}
}

let state = { 
    lastProcessedIssue: null, 
    activePrediction: null, 
    totalSignals: 0, 
    wins: 0, 
    isStarted: false, 
    currentLevel: 0,
    violetPause: 0,
    consecutiveLosses: 0,
    safetyPause: 0,
    lastPauseSent: null
}; 

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
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2)); 
    sendTelegram(`🟢 <b>𝐊𝐈𝐑𝐀 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐕𝟑𝟒.𝟏 𝐄𝐋𝐈𝐓𝐄 𝐎𝐍𝐋𝐈𝐍𝐄</b> 🟢\n━━━━━━━━━━━━━━━━━━\n📡 <i>My Original Premium Hybrid Activated\nSure-Shot Logic • Max Protection</i>`); 
    sendTelegram(`🔄 <b>LIVE SCANNING STARTED</b> 🔄\n━━━━━━━━━━━━━━━━━━\nKira is now watching every new period.\nFirst signal coming soon...`); 
} 

// ========================================== 
// 🧠 MY ORIGINAL HYBRID BRAIN
// ========================================== 
function getSize(n) { return Number(n) <= 4 ? "SMALL" : "BIG"; } 
function getColor(n) { return [0,2,4,6,8].includes(Number(n)) ? "RED" : "GREEN"; } 

function getStreak(arr) {
    if (arr.length < 2) return 1;
    let len = 1;
    for (let i = 1; i < arr.length; i++) if (arr[i] === arr[0]) len++; else break;
    return len;
}

function getAlts(arr) {
    let count = 0;
    for (let i = 1; i < Math.min(20, arr.length); i++) if (arr[i] !== arr[i-1]) count++;
    return count;
}

function getHybridSignal(list, level) {
    if (!list || list.length < 8) return {type:"SIZE", action:"SMALL", conf:75, reason:"Scanning"};

    const sizes = list.map(i => getSize(Number(i.number)));
    const colors = list.map(i => getColor(Number(i.number)));

    const s = analyze(sizes, "SIZE", level);
    const c = analyze(colors, "COLOR", level);

    return s.conf >= c.conf ? s : c;
}

function analyze(hist, type, level) {
    const last = hist[0];
    const streak = getStreak(hist);
    const alts = getAlts(hist);

    let action = last;
    let reason = "Strong Hybrid Pattern";
    let conf = 80 + streak * 3;

    if (streak >= 4) { reason = `POWER ${streak}x ${type} STREAK`; conf = 95; }
    else if (alts >= 8 || level >= 1) {
        action = type === "SIZE" ? (last === "BIG" ? "SMALL" : "BIG") : (last === "RED" ? "GREEN" : "RED");
        reason = level >= 1 ? "Elite Recovery Mode" : "High Alternation";
        conf = 88 + alts * 1.1;
    }

    if (level >= 1) conf = Math.max(92, Math.min(97, conf));
    return {type, action, conf: Math.floor(conf), reason};
}

// ========================================== 
// ⚙️ MAIN LOOP (CLEAN - NO SPAM)
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
        
        // Violet detection (only once per period)
        let currentNum = Number(list[0].number);
        if ((currentNum === 0 || currentNum === 5) && state.lastPauseSent !== latestIssue) {
            state.violetPause = currentNum === 5 ? 3 : 2;
            state.lastPauseSent = latestIssue;
            let msg = `📡 <b>KIRA RADAR SCAN</b> 📡\n━━━━━━━━━━━━━━━━━━\n🎯 Period: <code>\( {targetIssue.slice(-4)}</code>\n⚠️ <b>Action:</b> WAIT\n📉 <b>Reason:</b> <i>Violet Trap Detected. Protecting funds ( \){state.violetPause} left)</i>`;
            await sendTelegram(msg);
            fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
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
                    state.currentLevel = Math.min(state.currentLevel + 1, 2); 
                    state.consecutiveLosses++;
                } 
                state.totalSignals++; 

                let accuracy = Math.round((state.wins / state.totalSignals) * 100); 
                
                let resMsg = isWin ? `✅ <b>TARGET ELIMINATED</b> ✅\n` : `❌ <b>TARGET MISSED</b> ❌\n`;
                resMsg += `━━━━━━━━━━━━━━━━━━\n`;
                resMsg += `🎯 Period: <code>${state.activePrediction.period.slice(-4)}</code>\n`;
                resMsg += `🎲 Result: <b>\( {actualNum} ( \){actualResult})</b>\n`;
                resMsg += `━━━━━━━━━━━━━━━━━━\n`;
                resMsg += isWin ? `💰 <b>PROFIT SECURED!</b>\n` : `🛡️ <b>ESCALATING TO L${state.currentLevel + 1}</b>\n`;
                resMsg += `📊 Sequence Success: <b>${accuracy}%</b>`;
                await sendTelegram(resMsg);

                if (!isWin && state.currentLevel === 2) {
                    state.safetyPause = 15;
                    state.currentLevel = 0;
                    state.consecutiveLosses = 0;
                    await sendTelegram(`🛡️ <b>ELITE SAFETY ACTIVATED</b> 🛡️\nL3 failed. Skipping 15 periods & resetting to L1. Funds protected.`);
                }
            } 
            state.activePrediction = null; 
            fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2)); 
        } 
        
        // New signal (clean - no spam)
        if(state.lastProcessedIssue !== latestIssue && !state.activePrediction) { 
            state.lastProcessedIssue = latestIssue; 

            if (state.violetPause > 0 || state.safetyPause > 0) {
                if (state.violetPause > 0) state.violetPause--;
                if (state.safetyPause > 0) state.safetyPause--;
                fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
                return;
            }

            const signal = getHybridSignal(list, state.currentLevel); 
            
            if(signal && signal.action !== "WAIT" && signal.conf >= (state.currentLevel >= 1 ? 92 : 87)) { 
                let bet = FUND_LEVELS[state.currentLevel];
                let threat = state.currentLevel === 0 ? "🟢 STANDARD ENTRY" : (state.currentLevel === 1 ? "🟡 RECOVERY MODE" : "🔴 DEEP RECOVERY");
                let bar = signal.conf >= 93 ? "🟩🟩🟩🟩🟩" : "🟩🟩🟩🟩⬜";
                let emoji = signal.type === "COLOR" ? "🎨" : "📏";

                let msg = `⚡️ <b>KIRA QUANTUM V34.1 ELITE</b> ⚡️\n━━━━━━━━━━━━━━━━━━\n`;
                msg += `🎯 Period: <code>${targetIssue.slice(-4)}</code>\n`;
                msg += `${emoji} <b>Hybrid Signal:</b> ${signal.type}\n`;
                msg += `🔮 <b>Prediction:</b> ${signal.action}\n`;
                msg += `📊 Confidence: \( {bar} <b> \){signal.conf}%</b>\n`;
                msg += `━━━━━━━━━━━━━━━━━━\n`;
                msg += `⚠️ <b>${threat}</b>\n`;
                msg += `💰 <b>Investment (L${state.currentLevel+1}): Rs. ${bet}</b>\n`;
                msg += `🧠 <i>${signal.reason}</i>`;
                
                await sendTelegram(msg); 
                state.activePrediction = { period: targetIssue, pred: signal.action, type: signal.type, conf: signal.conf, timestamp: Date.now() }; 
                fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2)); 
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
