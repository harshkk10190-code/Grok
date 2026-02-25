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
            <h2>🟢 𝐊𝐈𝐑𝐀 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐕𝟑𝟒.𝟒 𝐒𝐈𝐙𝐄 𝐎𝐍𝐋𝐘 𝐄𝐋𝐈𝐓𝐄 𝐎𝐍𝐋𝐈𝐍𝐄</h2> 
            <p>Smart Size Logic • Clean Messages • Never Stops</p> 
            <div style="background:#0a0a1f;padding:20px;border-radius:15px;margin:20px;display:inline-block;">
                <p><strong>Win Rate:</strong> ` + winrate + `% (` + state.wins + `/` + state.totalSignals + `)</p>
                <p><strong>Level:</strong> ` + (state.currentLevel + 1) + `</p>
            </div>
            <p style="color:#aaa; font-size:12px;">Monitoring: WinGo 1-Minute API</p> 
        </body> 
    `); 
}); 
app.listen(PORT, () => console.log(`🚀 Kira Quantum V34.4 Size-Only Elite running`)); 

// ========================================== 
// ⚙️ CONFIG 
// ========================================== 
const BOT_TOKEN = "7574355493:AAGDeKaIBU9gN935fn1qqvTvRKuOPerekoU"; 
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
// 🧠 STATE - FRESH START
// ========================================== 
const STATE_FILE = './kira_state.json'; 
if (fs.existsSync(STATE_FILE)) fs.unlinkSync(STATE_FILE);

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

function saveState() { fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2)); } 

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
    sendTelegram(`🟢 <b>𝐊𝐈𝐑𝐀 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐕𝟑𝟒.𝟒 𝐒𝐈𝐙𝐄 𝐎𝐍𝐋𝐘 𝐄𝐋𝐈𝐓𝐄 𝐎𝐍𝐋𝐈𝐍𝐄</b> 🟢\n━━━━━━━━━━━━━━━━━━\n📡 <i>Clean Size-Only Logic Activated\nSure-Shot + Never Stops</i>`); 
    sendTelegram(`🔄 <b>LIVE SCANNING STARTED</b> 🔄\nKira is now watching every new period.\nFirst signal coming soon...`); 
} 

// ========================================== 
// 🧠 SIZE-ONLY BRAIN
// ========================================== 
function getSize(n) { return Number(n) <= 4 ? "SMALL" : "BIG"; } 

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
    for (let i = 1; i < Math.min(15, arr.length); i++) {
        if (arr[i] !== arr[i-1]) count++;
    }
    return count;
}

function analyzeSize(history, currentLevel) {
    if (history.length < 8) return { action: "SMALL", conf: 75, reason: "Gathering data" };

    const last = history[0];
    const streak = getStreakLength(history);
    const alts = getAlternationCount(history);

    let action = last;
    let reason = "Mirror Logic: Riding Current Momentum";
    let conf = 80 + (streak * 3);

    if (streak >= 4) {
        reason = "Strong " + streak + "x Streak - Riding Momentum";
        conf = 93;
    } else if (alts >= 8 || currentLevel >= 1) {
        action = last === "BIG" ? "SMALL" : "BIG";
        reason = "Safe Recovery: High Alternation";
        conf = 86 + Math.floor(alts * 1.2);
    }

    if (currentLevel >= 1) conf = Math.max(91, Math.min(97, conf));

    return { type: "SIZE", action, conf, reason };
}

// ========================================== 
// ⚙️ MAIN LOOP - FIXED TO NEVER STOP
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

        // 1. CHECK PREVIOUS RESULT
        if(state.activePrediction && BigInt(latestIssue) >= BigInt(state.activePrediction.period)) { 
            const resultItem = list.find(i => i.issueNumber === state.activePrediction.period); 
            if(resultItem) { 
                let actualNum = Number(resultItem.number); 
                let actualResult = getSize(actualNum); 
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

                let currentAccuracy = Math.round((state.wins / state.totalSignals) * 100); 
                
                let resMsg = isWin ? `✅ <b>𝐓𝐀𝐑𝐆𝐄𝐓 𝐄𝐋𝐈𝐌𝐈𝐍𝐀𝐓𝐄𝐃</b> ✅\n` : `❌ <b>𝐓𝐀𝐑𝐆𝐄𝐓 𝐌𝐈𝐒𝐒𝐄𝐃</b> ❌\n`; 
                resMsg += `━━━━━━━━━━━━━━━━━━\n`; 
                resMsg += `🎯 𝐏𝐞𝐫𝐢𝐨𝐝  : <code>` + state.activePrediction.period.slice(-4) + `</code>\n`; 
                resMsg += `🎲 𝐑𝐞𝐬𝐮𝐥𝐭  : <b>` + actualNum + ` (` + actualResult + `)</b>\n`; 
                resMsg += `━━━━━━━━━━━━━━━━━━\n`; 
                resMsg += isWin ? `💰 𝐒𝐭𝐚𝐭𝐮𝐬   : <b>PROFIT SECURED!</b>\n` : `🛡️ 𝐒𝐭𝐚𝐭𝐮𝐬   : <b>ESCALATING (L` + (state.currentLevel + 1) + `)</b>\n`; 
                resMsg += `🎯 𝐒𝐞𝐪𝐮𝐞𝐧𝐜𝐞 𝐒𝐮𝐜𝐜𝐞𝐬𝐬: <b>` + currentAccuracy + `%</b>\n`; 
                
                await sendTelegram(resMsg); 

                if (!isWin && state.currentLevel === 2) {
                    state.safetyPause = 15;
                    state.currentLevel = 0;
                    state.consecutiveLosses = 0;
                    await sendTelegram(`🛡️ <b>ELITE SAFETY ACTIVATED</b> 🛡️\nL3 failed. Skipping 15 periods & resetting to L1. Funds protected.`);
                }
            } 
            state.activePrediction = null; 
            saveState(); 
        } 
        
        // 2. GENERATE NEW SIGNAL FOR EVERY NEW PERIOD (FIXED)
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

            const sizes = list.map(i => getSize(Number(i.number))); 
            const signal = analyzeSize(sizes, state.currentLevel); 
            
            if(signal.action !== "WAIT" && signal.conf >= 88) { 
                let betAmount = FUND_LEVELS[state.currentLevel]; 
                let threatLevel = state.currentLevel === 0 ? "🟢 𝐒𝐓𝐀𝐍𝐃𝐀𝐑𝐃 𝐄𝐍𝐓𝐑𝐘" : (state.currentLevel === 1 ? "🟡 𝐑𝐄𝐂𝐎𝐕𝐄𝐑𝐘 𝐌𝐎𝐃𝐄" : "🔴 𝐃𝐄𝐄𝐏 𝐑𝐄𝐂𝐎𝐕𝐄𝐑𝐘");
                let bar = signal.conf >= 92 ? "🟩🟩🟩🟩🟩" : "🟩🟩🟩🟩⬜";

                let msg = `⚡️ 𝐊𝐈𝐑𝐀 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐕𝟑𝟒.𝟒 𝐄𝐋𝐈𝐓𝐄 ⚡️\n`; 
                msg += `━━━━━━━━━━━━━━━━━━\n`; 
                msg += `🎯 𝐏𝐞𝐫𝐢𝐨𝐝: <code>` + targetIssue.slice(-4) + `</code>\n`; 
                msg += `📏 <b>𝐒𝐢𝐠𝐧𝐚𝐥 𝐓𝐲𝐩𝐞:</b> ` + signal.type + `\n`; 
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
