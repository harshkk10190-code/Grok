const express = require('express'); 
const fs = require('fs'); 
const app = express(); 
const PORT = process.env.PORT || 3000; 

// ==========================================
// 🌐 WEB MONITOR 
// ==========================================
app.get('/', (req, res) => { 
    const winrate = state.totalSignals > 0 ? Math.round((state.wins / state.totalSignals) * 100) : 100;
    res.send(` 
        <body style="background:#050510; color:#00ff9d; font-family:monospace; text-align:center; padding:50px;"> 
            <h2>🟢 𝐊𝐈𝐑𝐀 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐕𝟑𝟏 (𝐓𝐇𝐄 𝐌𝐈𝐑𝐑𝐎𝐑 𝟐.𝟎) 𝐎𝐍𝐋𝐈𝐍𝐄</h2> 
            <p>Advanced Pattern Recognition • Dramatically Reduced Losing Streaks</p> 
            <div style="background:#0a0a1f;padding:15px;border-radius:10px;margin:20px;display:inline-block;">
                <p><strong>Win Rate:</strong> \( {winrate}% ( \){state.wins}/${state.totalSignals})</p>
                <p><strong>Current Level:</strong> ${state.currentLevel + 1} | Violet Pause: ${state.violetPause}</p>
            </div>
            <p style="color:#aaa; font-size:12px;">Monitoring: WinGo 1-Minute API • V31 Brain Active</p> 
        </body> 
    `); 
}); 
app.listen(PORT, () => console.log(`🚀 Kira Quantum V31 Server listening on port ${PORT}`)); 

// ========================================== 
// ⚙️ TELEGRAM & API CONFIGURATION 
// ========================================== 
const BOT_TOKEN = "7574355493:AAE20_DhKCiBh2-iyWdPEi8MurW3P4B-Pmk"; 
const TARGET_CHATS = ["1669843747", "-1002613316641"]; 
const API = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json?pageNo=1&pageSize=30"; 

const FUND_LEVELS = [33, 66, 100, 133, 168, 500]; 

const HEADERS = { 
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", 
    "Accept": "application/json, text/plain, */*", 
    "Origin": "https://www.dmwin2.com", 
    "Referer": "https://www.dmwin2.com/" 
}; 

// ========================================== 
// 🧠 MEMORY & STATE 
// ========================================== 
const STATE_FILE = './kira_state.json'; 
let state = { 
    lastProcessedIssue: null, 
    activePrediction: null, 
    totalSignals: 0, 
    wins: 0, 
    isStarted: false, 
    currentLevel: 0,
    violetPause: 0 
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
    sendTelegram(`🟢 <b>𝐊𝐈𝐑𝐀 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐕𝟑𝟏 𝐎𝐍𝐋𝐈𝐍𝐄</b> 🟢\n━━━━━━━━━━━━━━━━━━\n📡 <i>Advanced Mirror 2.0 Activated\nPattern Recognition + Smart Filtering Online</i>`); 
} 

// ========================================== 
// 🧠 NEW V31 BRAIN — REAL PATTERN ANALYSIS
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
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] !== arr[i-1]) count++;
    }
    return count;
}

function analyzeV31(history, typeLabel, currentLevel) {
    if (history.length < 8) return { action: "WAIT", conf: 0, reason: "GATHERING DATA" };

    const OPPOSITE = (val) => typeLabel === "SIZE" 
        ? (val === "BIG" ? "SMALL" : "BIG")
        : (val === "RED" ? "GREEN" : "RED");

    const streak = getStreakLength(history);
    const alts = getAlternationCount(history.slice(0, 12));
    const last = history[0];

    let action, reason, conf = 68;

    const isStrongStreak = streak >= 4 || (streak >= 3 && currentLevel < 2);
    const isStrongChop = alts >= 7 || currentLevel >= 3;

    if (isStrongStreak && currentLevel < 3) {
        action = last;
        reason = `Strong ${streak}x ${typeLabel} Streak Detected`;
        conf += streak * 7;
    } 
    else if (isStrongChop || currentLevel >= 2) {
        action = OPPOSITE(last);
        reason = `High Alternation Chop Mode (Recovery)`;
        conf += Math.floor(alts * 1.8);
    } 
    else {
        action = last; // neutral default
        reason = `Mild Momentum • Cautious Entry`;
    }

    // Safety filter after losses
    if (currentLevel >= 2 && streak < 2 && alts < 5) {
        conf -= 18; // weaken weak signals in recovery
    }

    conf = Math.min(97, Math.max(62, conf));

    return { type: typeLabel, action, conf, reason };
}

function getBestSignal(list, currentLevel) { 
    if (!list || list.length < 8) return { action: "WAIT", conf: 0, reason: "GATHERING DATA" }; 
    
    const sizes = list.map(i => getSize(Number(i.number))); 
    const colors = list.map(i => getColor(Number(i.number))); 
    
    let sizeSignal = analyzeV31(sizes, "SIZE", currentLevel);
    let colorSignal = analyzeV31(colors, "COLOR", currentLevel);

    // Prefer SIZE but only take it if confidence is decent
    if (sizeSignal.conf >= 78) return sizeSignal;
    if (colorSignal.conf > sizeSignal.conf + 5) return colorSignal;
    
    return sizeSignal; 
} 

// ========================================== 
// ⚙️ SERVER MAIN LOOP 
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
        
        // Violet handling
        const currentNum = Number(list[0].number);
        if (currentNum === 0 || currentNum === 5) {
            state.violetPause = Math.max(state.violetPause, currentNum === 5 ? 3 : 2);
        }

        // Check previous result
        if(state.activePrediction && BigInt(latestIssue) >= BigInt(state.activePrediction.period)) { 
            const resultItem = list.find(i => i.issueNumber === state.activePrediction.period); 
            if(resultItem) { 
                let actualNum = Number(resultItem.number); 
                let actualResult = state.activePrediction.type === "SIZE" ? getSize(actualNum) : getColor(actualNum); 
                let isWin = (actualResult === state.activePrediction.pred); 
                
                if(isWin) { 
                    state.wins++; 
                    state.currentLevel = 0; 
                } else { 
                    state.currentLevel = Math.min(state.currentLevel + 1, FUND_LEVELS.length - 1); 
                } 
                state.totalSignals++; 

                const accuracy = state.totalSignals > 0 ? Math.round((state.wins / state.totalSignals) * 100) : 100; 

                let resMsg = isWin ? `✅ <b>WIN - TARGET ELIMINATED</b> ✅\n` : `❌ <b>MISS - LEVEL UP</b> ❌\n`; 
                resMsg += `━━━━━━━━━━━━━━━━━━\n`; 
                resMsg += `🎯 Period: <code>${state.activePrediction.period.slice(-4)}</code>\n`; 
                resMsg += `🎲 Result: <b>\( {actualNum} ( \){actualResult})</b>\n`; 
                resMsg += `📊 Accuracy: <b>${accuracy}%</b>\n`;
                resMsg += isWin ? `💰 PROFIT SECURED!\n` : `🛡️ Escalating to L${state.currentLevel + 1}\n`;
                
                await sendTelegram(resMsg); 
            } 
            state.activePrediction = null; 
            saveState(); 
        } 
        
        // Generate new signal
        if(state.lastProcessedIssue !== latestIssue && !state.activePrediction) { 
            state.lastProcessedIssue = latestIssue; 

            if (state.violetPause > 0) {
                await sendTelegram(`📡 <b>KIRA RADAR</b> 📡\n━━━━━━━━━━━━━━━━━━\n🎯 Period: <code>\( {targetIssue.slice(-4)}</code>\n⚠️ WAIT - Violet Trap Clear ( \){state.violetPause} left)`);
                state.violetPause--;
                saveState();
                return;
            }

            const signal = getBestSignal(list, state.currentLevel); 
            
            if (signal.action !== "WAIT" && signal.conf >= 75) { 
                const betAmount = FUND_LEVELS[state.currentLevel]; 
                const threat = state.currentLevel >= 4 ? "🔴 DEEP RECOVERY" 
                              : state.currentLevel >= 2 ? "🟡 RECOVERY MODE" 
                              : "🟢 STANDARD";

                const bar = signal.conf >= 88 ? "🟩🟩🟩🟩🟩" : "🟩🟩🟩🟩⬜";

                let msg = `⚡️ <b>KIRA QUANTUM V31</b> ⚡️\n━━━━━━━━━━━━━━━━━━\n`;
                msg += `🎯 Period: <code>${targetIssue.slice(-4)}</code>\n`;
                msg += `📏 Signal: <b>${signal.type} → ${signal.action}</b>\n`;
                msg += `📊 Confidence: \( {bar} <b> \){signal.conf}%</b>\n`;
                msg += `━━━━━━━━━━━━━━━━━━\n`;
                msg += `${threat}\n`;
                msg += `💰 Investment: <b>Rs. \( {betAmount}</b> (L \){state.currentLevel + 1})\n`;
                msg += `<i>${signal.reason}</i>`;

                await sendTelegram(msg); 

                state.activePrediction = { 
                    period: targetIssue, 
                    pred: signal.action, 
                    type: signal.type, 
                    conf: signal.conf, 
                    timestamp: Date.now() 
                }; 
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
