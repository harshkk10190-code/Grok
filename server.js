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
            <h2>🟢 𝐊𝐈𝐑𝐀 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐕𝟑𝟏.𝟓 (𝐓𝐇𝐄 𝐌𝐈𝐑𝐑𝐎𝐑) 𝐎𝐍𝐋𝐈𝐍𝐄</h2> 
            <p>High Frequency + Smart Recovery • Fewer Losing Streaks</p> 
            <div style="background:#0a0a1f;padding:15px;border-radius:10px;margin:20px;display:inline-block;">
                <p><strong>Win Rate:</strong> \( {winrate}% ( \){state.wins}/${state.totalSignals})</p>
                <p><strong>Level:</strong> ${state.currentLevel + 1} | Violet Pause: ${state.violetPause}</p>
            </div>
            <p style="color:#aaa; font-size:12px;">Monitoring: WinGo 1-Minute API • V31.5 Active</p> 
        </body> 
    `); 
}); 
app.listen(PORT, () => console.log(`🚀 Kira Quantum V31.5 Server listening on port ${PORT}`)); 

// ========================================== 
// ⚙️ TELEGRAM & API CONFIGURATION 
// ========================================== 
const BOT_TOKEN = "7574355493:AAGJquhuW38x4pSy63IkyCQmnH5bG3l_xC0"; 
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
    sendTelegram(`🟢 <b>𝐊𝐈𝐑𝐀 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐕𝟑𝟏.𝟓 𝐎𝐍𝐋𝐈𝐍𝐄</b> 🟢\n━━━━━━━━━━━━━━━━━━\n📡 <i>High-Frequency Mirror Activated\nSmart Recovery Logic Online</i>`); 
} 

// ========================================== 
// 🧠 V31.5 BRAIN (SMART + HIGH FREQUENCY)
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
    for (let i = 1; i < Math.min(12, arr.length); i++) {
        if (arr[i] !== arr[i-1]) count++;
    }
    return count;
}

function analyzeV31(history, typeLabel, currentLevel) {
    const last = history.length > 0 ? history[0] : "SMALL";

    if (history.length < 6) {
        return { action: last, conf: 72, reason: "GATHERING DATA" };
    }

    const OPPOSITE = (val) => typeLabel === "SIZE" 
        ? (val === "BIG" ? "SMALL" : "BIG")
        : (val === "RED" ? "GREEN" : "RED");

    const streak = getStreakLength(history);
    const alts = getAlternationCount(history);

    let action = last;
    let reason = "Standard Mirror Logic";
    let conf = 72 + (streak * 4);

    if (streak >= 4) {
        reason = `Strong ${streak}x Streak - Riding Momentum`;
        conf = 89 + Math.min(streak * 2, 8);
    } else if (alts >= 6 || currentLevel >= 2) {
        action = OPPOSITE(last);
        reason = currentLevel >= 2 ? "Recovery: Catching Alternation Chop" : "Alternation Detected";
        conf = 77 + Math.floor(alts * 1.6);
    }

    if (currentLevel >= 3) conf = Math.max(78, Math.min(96, conf));
    else conf = Math.min(96, conf);

    return { type: typeLabel, action, conf, reason };
}

function getBestSignal(list, currentLevel) { 
    if(!list || list.length < 6) return { type: "SIZE", action: "SMALL", conf: 70, reason: "GATHERING DATA" }; 
    
    const sizes = list.map(i => getSize(Number(i.number))); 
    let signal = analyzeV31(sizes, "SIZE", currentLevel);

    if (currentLevel >= 4 && signal.conf < 78) {
        signal.action = "WAIT";
    }
    return signal; 
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
        
        let currentNum = Number(list[0].number);
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

                let currentAccuracy = Math.round((state.wins / state.totalSignals) * 100); 
                
                let resMsg = isWin ? `✅ <b>𝐓𝐀𝐑𝐆𝐄𝐓 𝐄𝐋𝐈𝐌𝐈𝐍𝐀𝐓𝐄𝐃</b> ✅\n` : `❌ <b>𝐓𝐀𝐑𝐆𝐄𝐓 𝐌𝐈𝐒𝐒𝐄𝐃</b> ❌\n`; 
                resMsg += `━━━━━━━━━━━━━━━━━━\n`; 
                resMsg += `🎯 𝐏𝐞𝐫𝐢𝐨𝐝  : <code>${state.activePrediction.period.slice(-4)}</code>\n`; 
                resMsg += `🎲 𝐑𝐞𝐬𝐮𝐥𝐭  : <b>\( {actualNum} ( \){actualResult})</b>\n`; 
                resMsg += `━━━━━━━━━━━━━━━━━━\n`; 
                resMsg += isWin ? `💰 𝐒𝐭𝐚𝐭𝐮𝐬   : <b>PROFIT SECURED!</b>\n` : `🛡️ 𝐒𝐭𝐚𝐭𝐮𝐬   : <b>ESCALATING (L${state.currentLevel + 1})</b>\n`; 
                resMsg += `🎯 𝐒𝐞𝐪𝐮𝐞𝐧𝐜𝐞 𝐒𝐮𝐜𝐜𝐞𝐬𝐬: <b>${currentAccuracy}%</b>\n`; 
                
                await sendTelegram(resMsg); 
            } 
            state.activePrediction = null; 
            saveState(); 
        } 
        
        // Generate signal
        if(state.lastProcessedIssue !== latestIssue && !state.activePrediction) { 
            state.lastProcessedIssue = latestIssue; 

            if (state.violetPause > 0) {
                let msg = `📡 <b>𝐊𝐈𝐑𝐀 𝐑𝐀𝐃𝐀𝐑 𝐒𝐂𝐀𝐍</b> 📡\n`; 
                msg += `━━━━━━━━━━━━━━━━━━\n`; 
                msg += `🎯 𝐏𝐞𝐫𝐢𝐨𝐝: <code>${targetIssue.slice(-4)}</code>\n`; 
                msg += `⚠️ <b>𝐀𝐜𝐭𝐢𝐨𝐧:</b> WAIT\n`; 
                msg += `📉 <b>𝐑𝐞𝐚𝐬𝐨𝐧:</b> <i>Casino Trap Detected. Pausing to clear board. (${state.violetPause} left)</i>`;
                await sendTelegram(msg); 
                state.violetPause--;
                saveState();
                return;
            }

            const signal = getBestSignal(list, state.currentLevel); 
            
            if(signal && signal.action !== "WAIT") { 
                let signalEmoji = "📏"; 
                let betAmount = FUND_LEVELS[state.currentLevel]; 

                let threatLevel = "🟢 𝐒𝐓𝐀𝐍𝐃𝐀𝐑𝐃 𝐄𝐍𝐓𝐑𝐘";
                if (state.currentLevel >= 2) threatLevel = "🟡 𝐀𝐃𝐀𝐏𝐓𝐈𝐕𝐄 𝐑𝐄𝐂𝐎𝐕𝐄𝐑𝐘";
                if (state.currentLevel >= 4) threatLevel = "🔴 𝐃𝐄𝐄𝐏 𝐑𝐄𝐂𝐎𝐕𝐄𝐑𝐘";

                let bar = "🟩🟩🟩🟩🟩";
                if (signal.conf < 85) bar = "🟩🟩🟩🟩⬜";
                
                let msg = `⚡️ 𝐊𝐈𝐑𝐀 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐕𝟑𝟏.𝟓 ⚡️\n`; 
                msg += `━━━━━━━━━━━━━━━━━━\n`; 
                msg += `🎯 𝐏𝐞𝐫𝐢𝐨𝐝: <code>${targetIssue.slice(-4)}</code>\n`; 
                msg += `${signalEmoji} <b>𝐒𝐢𝐠𝐧𝐚𝐥 𝐓𝐲𝐩𝐞:</b> ${signal.type}\n`; 
                msg += `🔮 <b>𝐏𝐫𝐞𝐝𝐢𝐜𝐭𝐢𝐨𝐧: ${signal.action}</b>\n`; 
                msg += `📊 𝐂𝐨𝐧𝐟𝐢𝐝𝐞𝐧𝐜𝐞: \( {bar} <b> \){signal.conf}%</b>\n`; 
                msg += `━━━━━━━━━━━━━━━━━━\n`; 
                msg += `⚠️ <b>${threatLevel}</b>\n`; 
                msg += `💰 <b>𝐈𝐧𝐯𝐞𝐬𝐭𝐦𝐞𝐧𝐭 (𝐋${state.currentLevel + 1}): Rs. ${betAmount}</b>\n`; 
                msg += `🧠 <i>${signal.reason}</i>`; 
                
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
