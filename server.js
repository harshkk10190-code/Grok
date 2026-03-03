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
            <h2>🏛️ 𝐉𝐀𝐑𝐕𝐈𝐒 🤖 𝐈𝐍𝐒𝐓𝐈𝐓𝐔𝐓𝐈𝐎𝐍𝐀𝐋 𝐐𝐔𝐀𝐍𝐓 (𝐕𝟔.𝟎) 🏛️</h2>
            <p>Advanced PDF Trend Engine. Market Health Monitor Active.</p>
        </body>
    `);
});
app.listen(PORT, () => console.log(`🚀 JᴀʀᴠᎥຮ V6.0 Quant Algo listening on port ${PORT}`));

// ==========================================
// ⚙️ CONFIGURATION
// ==========================================
const TELEGRAM_BOT_TOKEN = "7574355493:AAHjeaZAvJTme5-3Ttbzoc6FTZh4DFYkwP4"; 
const TARGET_CHATS = ["1669843747", "-1002613316641"];

const WINGO_API = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json?pageNo=1&pageSize=30";
const FUND_LEVELS = [33, 66, 130, 260, 550, 1100]; 

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
    waitCount: 0,
    skipStreak: 0,
    cooldownCycles: 0,
wasOverheated: false,
recoveryMode: false,
shockLockIssue: null,
cooldownLockIssue: null
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

function divider(){
    return `<pre>⟡ ════════ ⋆★⋆ ════════ ⟡</pre>\n`;
}

if (!state.isStarted) { 
    state.isStarted = true; 
    saveState(); 
    let bootMsg = `🏛️ <b>𝐉𝐀𝐑𝐕𝐈𝐒 𝐕𝟔.𝟎 𝐈𝐍𝐒𝐓𝐈𝐓𝐔𝐓𝐈𝐎𝐍𝐀𝐋</b> 🏛️\n⟡ ════════ ⋆★⋆ ════════ ⟡\n\n🛡️ <i>Market Health Monitor Active.</i>\n📏 <i>Size-Only Quantitative Logic Loaded.</i>\n📈 <i>11/11 Master Trends Calibrated.</i>\n\n⟡ ════════ ⋆★⋆ ════════ ⟡`; 
    sendTelegram(bootMsg); 
} 

// ==========================================
// 📊 MARKET HEALTH MONITOR
// ==========================================
function getMarketHealth() {
    if (state.currentLevel === 0 || state.currentLevel === 1) return "STABLE ♻️";
    if (state.currentLevel === 2 || state.currentLevel === 3) return "VOLATILE 🌕";
    return "DANGEROUS 🩸";
}

function getHeatMeter(){

    let heat = 0;

    // Loss escalation increases heat
    heat += state.currentLevel * 1.5;

    // Waiting cools heat
    heat -= Math.min(state.waitCount, 3);

    // Clamp
    heat = Math.max(0, Math.min(5, Math.round(heat)));

    const bars = "█".repeat(heat) + "░".repeat(5 - heat);

    let label = "Calm";

    if(heat >= 4) label = "Overheated";
    else if(heat >= 2) label = "Trend Building";

    // ==========================
    // 🔥 HEAT MEMORY TRACKING
    // ==========================
    if(label === "Overheated"){
        state.wasOverheated = true;
        state.cooldownCycles = 0;
    }

    if(state.wasOverheated && label !== "Overheated"){
        state.cooldownCycles++;
    }

    return {
        bars,
        label
    };
}

function heatLock(){

    const heat = getHeatMeter();

    if(heat.label === "Overheated"){
        return {
            blocked: true,
            reason: "Heat Lock Active"
        };
    }

    return { blocked:false };
}

function cooldownGate(){

    const heat = getHeatMeter();

    if(state.wasOverheated){

        if(state.cooldownCycles < 2){
            return {
                blocked:true,
                reason:"Cooldown Stabilizing"
            };
        }

        state.wasOverheated = false;
        state.cooldownCycles = 0;
    }

    return { blocked:false };
}

function shockTrap(list){

    let sizes = list.slice(0,6).map(i => Number(i.number) <= 4 ? 'S' : 'B');

    let last = sizes[0];
    let prevStreak = 1;

    for(let i=1;i<5;i++){
        if(sizes[i] === sizes[i+1]) prevStreak++;
        else break;
    }

    const heat = getHeatMeter();

    // FAKE BREAKOUT CONDITIONS

    // Calm market but sudden spike
    if(heat.label === "Calm" && prevStreak >= 4){
        if(sizes[0] !== sizes[1]){
            return { trapped:true, reason:"Sudden Spike After Calm" };
        }
    }

    // Overheated market reversal spike
    if(heat.label === "Overheated" && sizes[0] !== sizes[1]){
        return { trapped:true, reason:"Heat Reversal Trap" };
    }

    return { trapped:false };
}

function getConfidence(patternLength, regime, gravityAligned){

    let score = 50;

    if(patternLength >= 5) score += 20;
    else if(patternLength >= 4) score += 10;

    if(regime === "TREND") score += 20;
if(regime === "STABLE") score += 5;
    if(regime === "CHOP") score -= 25;

    if(gravityAligned) score += 10;

    return Math.max(40, Math.min(95, score));
}

function regimeShield(list){

    let sizes = list.slice(0, 12).map(i => Number(i.number) <= 4 ? 'S' : 'B');

    // -------- FLIP DENSITY --------
    let flips = 0;
    for(let i=0;i<10;i++){
        if(sizes[i] !== sizes[i+1]) flips++;
    }

    // -------- ALT DETECTION --------
    let altCount = 0;
    for(let i=0;i<8;i++){
        if(sizes[i] !== sizes[i+1] && sizes[i+1] !== sizes[i+2]) altCount++;
    }

    // -------- MOMENTUM CHECK --------
    let streak = 1;
    for(let i=1;i<6;i++){
        if(sizes[i] === sizes[0]) streak++;
        else break;
    }

    // -------- EXPANSION CHECK --------
    let expansion = false;
    if(
        sizes.slice(0,5).join('') === 'BBBBS' ||
        sizes.slice(0,5).join('') === 'SSSSB'
    ){
        expansion = true;
    }

    // -------- DECISION --------
    if(flips >= 6){
        return { tradable:false, reason:"Flip Storm" };
    }

    if(altCount >= 4){
        return { tradable:false, reason:"Alternation Trap" };
    }

    if(expansion){
        return { tradable:false, reason:"Expansion Chaos" };
    }

    if(streak >= 5){
        return { tradable:true, reason:"Strong Trend" };
    }

    return { tradable:true, reason:"Stable Flow" };
}

function survivalReset(regime, confidence){

    if(regime === "CHOP" && state.currentLevel >= 2){
    state.currentLevel = 0;
    sendTelegram("🛡️ <b>SURVIVAL RESET</b> – Chop detected. Level cleared.");
    return true;
}

    if(confidence < 55 && state.currentLevel >= 1){
        state.currentLevel = 0;
        return true;
    }

    return false;
}

// ==========================================
// 📈 SMART 11-PATTERN ALGORITHM (V6.0 DEEP SCAN)
// ==========================================

function analyzeTrendsV7(list){

    const regime = regimeShield(list);

    if(!regime.tradable){
        return {
            action:"WAIT",
            regime:"CHOP",
            confidence:0,
            reason:`Regime Shield: ${regime.reason}`
        };
    }

    let sizes = list.slice(0, 10).map(i => Number(i.number) <= 4 ? 'S' : 'B');

    let forward = sizes.join('');
    let reverse = sizes.slice().reverse().join('');

    const match = (p)=> forward.endsWith(p) || reverse.endsWith(p);

    let small=0,big=0;
    for(let i=0;i<5;i++){
        let n = Number(list[i].number);
        if(n<=4) small++; else big++;
    }

    let gravity = small>big?'S':'B';

    let decision = null;
    let length = 0;

    if(match('SSSBB')) { decision='BIG'; length=5; }
    else if(match('BBBSS')) { decision='SMALL'; length=5; }
    else if(match('BBSS')) { decision='BIG'; length=4; }
    else if(match('SSBB')) { decision='SMALL'; length=4; }
    else if(match('BSBS')) { decision='BIG'; length=4; }
    else if(match('SBSB')) { decision='SMALL'; length=4; }

    if(!decision){
    return {
        action:"WAIT",
        regime:"MIXED",
        confidence:0,
        reason:"No Pattern Alignment"
    };
}

    let gravityAligned =
        (gravity === 'S' && decision === 'SMALL') ||
        (gravity === 'B' && decision === 'BIG');

    let regimeType;

if(regime.reason === "Strong Trend"){
    regimeType = "TREND";
}
else if(regime.reason === "Stable Flow"){
    regimeType = "STABLE";
}
else{
    regimeType = "CHOP";
}

    let confidence = getConfidence(length, regimeType, gravityAligned);

    return {
        action: decision,
        regime: regimeType,
        confidence,
        reason: `Pattern-${length}`
    };
}

// ========================================== 
// ⚙️ SERVER MAIN LOOP 
// ========================================== 
let isProcessing = false; 

function getSize(n) { return n <= 4 ? "SMALL" : "BIG"; } 

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
                    let actualResult = getSize(actualNum); 
                    let isWin = (actualResult === state.activePrediction.pred); 
                    
                    if(isWin) { 
    state.wins++; 
    state.totalSignals++; 
    state.currentLevel = 0; 
} else { 
    state.currentLevel++; 

    if(state.currentLevel >= FUND_LEVELS.length - 1){

        state.totalSignals++;
        state.currentLevel = Math.floor(FUND_LEVELS.length / 2);
        state.recoveryMode = true;
        state.wasOverheated = true;
        state.cooldownCycles = 0;

        await sendTelegram(`🛡️ <b>RECOVERY MODE ACTIVATED</b>
Post-loss survival engaged.
Cooling before next entry.`);
    }

}  // ✅ THIS WAS MISSING
                    
                    let currentAccuracy = state.totalSignals > 0 ? Math.round((state.wins / state.totalSignals) * 100) : 100; 
                    let marketHealth = getMarketHealth();
                    const heat = getHeatMeter();
                    
                    // 🏛️ V6.0 TERMINAL UI UPDATE
                    let resMsg = isWin ? `✅ <b>𝐏𝐑𝐎𝐅𝐈𝐓 𝐒𝐄𝐂𝐔𝐑𝐄𝐃</b> ✅\n` : `🛑 <b>𝐓𝐀𝐑𝐆𝐄𝐓 𝐌𝐈𝐒𝐒𝐄𝐃</b> 🛑\n`; 
                    resMsg += divider(); 
                    resMsg += `🎯 <b>𝐏𝐞𝐫𝐢𝐨𝐝 :</b> <code>${state.activePrediction.period.slice(-4)}</code>\n`; 
                    resMsg += `🎲 <b>𝐑𝐞𝐬𝐮𝐥𝐭 :</b> ${actualNum} (${actualResult})\n`; 
                    resMsg += `📈 <b>𝐌𝐚𝐫𝐤𝐞𝐭 𝐇𝐞𝐚𝐥𝐭𝐡 :</b> ${marketHealth}\n`;
                    resMsg += `🔥 <b>𝐌𝐚𝐫𝐤𝐞𝐭 𝐇𝐞𝐚𝐭 :</b> ${heat.bars} (${heat.label})\n`;
                    
                    if(!isWin) {
                        resMsg += `🛡️ <b>𝐒𝐭𝐚𝐭𝐮𝐬 :</b> 𝐄𝐒𝐂𝐀𝐋𝐀𝐓𝐈𝐍𝐆 (𝐋𝐞𝐯𝐞𝐥 ${state.currentLevel + 1})\n`; 
                    }
                    resMsg += `🏆 <b>𝐖𝐢𝐧 𝐑𝐚𝐭𝐞 :</b> ${currentAccuracy}%\n`;
                    resMsg += divider(); 
                    
                    await sendTelegram(resMsg); 
                } 
                state.activePrediction = null; saveState(); 
            } 
        } 
        
        if(state.lastProcessedIssue !== latestIssue) {


    if(!state.activePrediction) {

    const signal = analyzeTrendsV7(list);

// ❄️ COOLDOWN MODE
const coolBlock = cooldownGate();

if(coolBlock.blocked){

    if(state.cooldownLockIssue !== latestIssue){
        state.cooldownLockIssue = latestIssue;

        let msg = `❄️ <b>COOLDOWN MODE ACTIVE</b> ❄️\n`;
        msg += divider();
        msg += `🎯 𝐏𝐞𝐫𝐢𝐨𝐝: <code>${targetIssue.slice(-4)}</code>\n`;
        msg += `🛡️ <b>Post-Heat Recovery</b>\n`;
        msg += `📉 <i>Waiting for stable flow before entry</i>`;
        msg += divider();

        await sendTelegram(msg);
    }

    state.waitCount++;
    saveState();
    return;
}

// ⚡ V7.6 SHOCK TRAP
const shock = shockTrap(list);

if(shock.trapped){

    if(state.shockLockIssue !== latestIssue){
    state.shockLockIssue = latestIssue;

        let msg = `⚡ <b>SHOCK TRAP DETECTED</b> ⚡\n`;
        msg += divider();
        msg += `🎯 𝐏𝐞𝐫𝐢𝐨𝐝: <code>${targetIssue.slice(-4)}</code>\n`;
        msg += `🛑 <b>Fake Breakout Blocked</b>\n`;
        msg += `🧠 <i>${shock.reason}</i>`;
        msg += divider();

        await sendTelegram(msg);
    }

    state.waitCount++;
    saveState();
    return;
}

if(signal.action !== "WAIT"){

    if(survivalReset(signal.regime, signal.confidence)){
        console.log("🛡️ Survival Reset Triggered");
    }

    if(signal.regime === "CHOP"){
        state.skipStreak++;
        if(state.skipStreak < 3){
            return;
        }
    } else {
        state.skipStreak = 0;
    }
}
                let marketHealth = getMarketHealth();
                const heat = getHeatMeter();
                
                console.log(`\n[${new Date().toLocaleTimeString()}] 🎯 Period ${targetIssue.slice(-4)} | ALGO DECISION:`, signal);
                
                if(signal && signal.action === "WAIT") {

   

    state.waitCount++;

    if (state.waitCount === 1 || state.waitCount % 15 === 0) {

        let msg = `📡 <b>𝐉𝐀𝐑𝐕𝐈𝐒 𝐌𝐀𝐑𝐊𝐄𝐓 𝐒𝐂𝐀𝐍</b> 📡\n`;
        msg += divider();
        msg += `🎯 𝐏𝐞𝐫𝐢𝐨𝐝: <code>${targetIssue.slice(-4)}</code>\n`;
        msg += `⚠️ <b>𝐀𝐜𝐭𝐢𝐨𝐧:</b> SKIP\n`;
        msg += `🛡️ <b>𝐑𝐞𝐠𝐢𝐦𝐞:</b> ${signal.regime}\n`;
        msg += `🔥 <b>𝐌𝐚𝐫𝐤𝐞𝐭 𝐇𝐞𝐚𝐭 :</b> ${heat.bars} (${heat.label})\n`;
        msg += `🧠 <b>𝐑𝐞𝐚𝐬𝐨𝐧:</b> <i>${signal.reason}</i>\n`;
        msg += `🔇 <i>(Silencing further scans to prevent spam)</i>`;
        msg += divider();

        await sendTelegram(msg);
    }

    saveState();
} else if(
    signal &&
    signal.action !== "WAIT" &&
    (
        // 🔥 Strong Trend Entry
        (signal.regime === "TREND" && signal.confidence >= 60)

        ||

        // ⚖️ Balanced Mixed Entry
        (signal.regime === "STABLE" && signal.confidence >= 75)
    )
) {

    const heatBlock = heatLock();

    if(heatBlock.blocked){

    state.waitCount++;

    let msg = `🛑 <b>𝐇𝐄𝐀𝐓 𝐋𝐎𝐂𝐊 𝐀𝐂𝐓𝐈𝐕𝐄</b> 🛑\n`;
    msg += divider();
    msg += `🎯 𝐏𝐞𝐫𝐢𝐨𝐝: <code>${targetIssue.slice(-4)}</code>\n`;
    msg += `🔥 <b>Market Status:</b> OVERHEATED\n`;
    msg += `🛡️ <b>Protection:</b> Trade Blocked\n`;
    msg += `📉 <i>Cooling required before next entry</i>`;
    msg += divider();

    await sendTelegram(msg);

    saveState();
    return;
}

state.waitCount = 0;
                    if(state.recoveryMode){
    state.currentLevel = Math.max(1, Math.floor(FUND_LEVELS.length / 2));
    state.recoveryMode = false;
}

let betAmount = FUND_LEVELS[state.currentLevel]; 
                    
                    // 🏛️ V6.0 TERMINAL UI UPDATE
                    let msg = `🏛️ <b>𝐉𝐀𝐑𝐕𝐈𝐒 𝐈𝐍𝐒𝐓𝐈𝐓𝐔𝐓𝐈𝐎𝐍𝐀𝐋 : 𝐄𝐗𝐄𝐂𝐔𝐓𝐄</b> 🏛️\n`; 
                    msg += divider(); 
                    msg += `🎯 <b>𝐓𝐚𝐫𝐠𝐞𝐭 𝐏𝐞𝐫𝐢𝐨𝐝 :</b> <code>${targetIssue.slice(-4)}</code>\n`; 
                    msg += `📈 <b>𝐌𝐚𝐫𝐤𝐞𝐭 𝐇𝐞𝐚𝐥𝐭𝐡 :</b> ${marketHealth}\n`;
                    msg += `🔥 <b>𝐌𝐚𝐫𝐤𝐞𝐭 𝐇𝐞𝐚𝐭 :</b> ${heat.bars} (${heat.label})\n`;
                    msg += `📊 <b>𝐌𝐞𝐭𝐫𝐢𝐜 :</b> SIZE ONLY 📏\n`; 
                    msg += `🛡️ <b>𝐑𝐞𝐠𝐢𝐦𝐞 :</b> ${signal.regime}\n`;
                    msg += divider();
                    msg += `🔮 <b>𝐐𝐮𝐚𝐧𝐭 𝐒𝐢𝐠𝐧𝐚𝐥 : ${signal.action}</b>\n`;
                    msg += `💎 <b>𝐄𝐧𝐭𝐫𝐲 𝐋𝐞𝐯𝐞𝐥 :</b> Level ${state.currentLevel + 1}\n`; 
                    msg += `💰 <b>𝐈𝐧𝐯𝐞𝐬𝐭𝐦𝐞𝐧𝐭 :</b> Rs. ${betAmount}\n`; 
                    msg += `🧠 <b>𝐂𝐡𝐚𝐫𝐭 𝐋𝐨𝐠𝐢𝐜 :</b> <i>${signal.reason}</i>\n`;
msg += `📊 <b>𝐂𝐨𝐧𝐟𝐢𝐝𝐞𝐧𝐜𝐞 :</b> ${signal.confidence}%`; 
                    msg += divider();
                    await sendTelegram(msg); 
                    state.activePrediction = { period: targetIssue, pred: signal.action, type: "SIZE", conf: 100, timestamp: Date.now() }; 
                    saveState(); 
                } 
            } 
            state.shockLockIssue = null;
state.cooldownLockIssue = null;
state.lastProcessedIssue = latestIssue;
saveState();
        } 
    } catch (e) {
        console.log(`[API ERROR] ${e.message}`);
    } finally { 
        isProcessing = false; 
    } 
} 

setInterval(tick, 3000); 
tick();
