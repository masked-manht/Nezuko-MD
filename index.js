const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const express = require('express');
const QRCode = require('qrcode');
const path = require('path');

const app = express();
const port = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let qrCodeImage = null; 
let currentPairCode = null;
let botStatus = "Associez votre appareil WhatsApp";
let sockInstance = null;

async function startNezuko() {
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'session'));
    
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: state
    });

    sockInstance = sock;
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            try {
                qrCodeImage = await QRCode.toDataURL(qr);
                botStatus = "Associez votre appareil WhatsApp"; 
            } catch (err) {
                console.error("Erreur QR :", err);
            }
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            
            if (!shouldReconnect) {
                botStatus = "Session expirée. Réinitialisation...";
                qrCodeImage = null;
                currentPairCode = null;
            } else {
                botStatus = "En attente d'association... (Prêt)";
            }
            
            if (shouldReconnect) startNezuko();
        } else if (connection === 'open') {
            botStatus = "Nezuko-v1 est connecté et actif ! ✅";
            qrCodeImage = null;
            currentPairCode = null;
        }
    });

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
        } catch (err) {
            console.error(err);
        }
    });
}

// --- LOGIQUE POUR LE CODE DE COUPLAGE (PAIR CODE) ---
app.post('/api/paircode', async (req, res) => {
    let num = req.body.number;
    if (!num) return res.status(400).send({ error: "Numéro manquant" });
    
    num = num.replace(/[^0-9]/g, ''); // Nettoie le numéro pour ne garder que les chiffres
    
    try {
        if (sockInstance && !sockInstance.authState.creds.registered) {
            let code = await sockInstance.requestPairingCode(num);
            currentPairCode = code.match(/.{1,4}/g)?.join('-') || code;
            return res.send({ code: currentPairCode });
        } else {
            return res.send({ code: "Déjà connecté ou indisponible" });
        }
    } catch (err) {
        console.error("Erreur génération Pair Code :", err);
        return res.status(500).send({ error: "Erreur serveur" });
    }
});

// --- INTERFACE WEB ---
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Nezuko-v1 - Connexion</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; text-align: center; background-color: #fafafa; color: #1a1a1a; padding: 30px 10px; margin: 0; }
                .card { background: #ffffff; padding: 30px 20px; border-radius: 20px; display: inline-block; box-shadow: 0 10px 40px rgba(0,0,0,0.06); max-width: 450px; width: 100%; box-sizing: border-box; border: 1px solid #eaeaea; }
                .avatar { width: 80px; height: 80px; background: #000; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-size: 40px; }
                h1 { font-size: 1.6em; font-weight: bold; margin: 0 0 5px 0; color: #000000; }
                .status { font-size: 0.95em; color: #ff4a5a; font-weight: 600; margin-bottom: 25px; }
                
                .tabs { display: flex; background: #f0f0f0; border-radius: 12px; padding: 4px; margin-bottom: 20px; }
                .tab-btn { flex: 1; padding: 12px; border: none; background: transparent; font-weight: bold; font-size: 0.9em; cursor: pointer; border-radius: 10px; transition: 0.2s; color: #555; }
                .tab-btn.active { background: #ffffff; color: #000000; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                
                .content-section { display: none; }
                .content-section.active { display: block; }
                
                .input-title { text-align: left; font-size: 0.9em; font-weight: bold; margin-bottom: 8px; color: #333; }
                input { width: 100%; padding: 14px; border: 1px solid #dddddd; border-radius: 12px; font-size: 1em; box-sizing: border-box; background: #f9f9f9; text-align: center; margin-bottom: 15px; }
                button.action-btn { width: 100%; padding: 14px; border: none; background: #000000; color: #fff; font-size: 1em; font-weight: bold; border-radius: 12px; cursor: pointer; transition: 0.2s; }
                button.action-btn:hover { background: #222; }
                
                .result-box { background: #f4f4f6; padding: 14px; border-radius: 12px; font-weight: bold; font-size: 1.4em; margin-top: 15px; border: 1px dashed #000; letter-spacing: 2px; color: #000; }
                
                .qr-container img { background: white; padding: 10px; border: 1px solid #eee; border-radius: 12px; width: 220px; height: 220px; margin-top: 10px; }
                .instructions { font-size: 0.85em; color: #777; line-height: 1.6; margin-top: 15px; text-align: left; background: #f9f9f9; padding: 15px; border-radius: 12px; }
                
                .footer { margin-top: 25px; font-size: 0.8em; color: #999; }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="avatar">🤖</div>
                <h1>Code de paire de bots Nezuko-v1</h1>
                <div class="status" id="state-status">${botStatus}</div>
                
                <div class="tabs">
                    <button class="tab-btn active" onclick="switchTab('pair-section', this)">🔑 Code de paire</button>
                    <button class="tab-btn" onclick="switchTab('qr-section', this)">🏁 Code QR</button>
                </div>
                
                <div id="pair-section" class="content-section active">
                    <div class="input-title">Saisissez votre numéro WhatsApp avec l'indicatif du pays :</div>
                    <input type="text" id="phone-number" placeholder="5093542014" value="5093542014">
                    <button class="action-btn" onclick="getPairCode()">🔑 Générer un code de paire</button>
                    <div id="code-display" class="result-box" style="display:none;"></div>
                </div>
                
                <div id="qr-section" class="content-section">
                    <div class="qr-container">
                        ${qrCodeImage ? `<img src="${qrCodeImage}" alt="QR Code">` : '<p style="color:#888; padding:40px 0;">Génération du QR Code en cours (ou déjà connecté)...</p>'}
                    </div>
                    <div class="instructions">
                        1. Ouvrez WhatsApp sur votre téléphone.<br>
                        2. Accédez à Paramètres > Appareils associés.<br>
                        3. Appuyez sur « Associer un appareil ».<br>
                        4. Scannez le code QR ci-dessus.
                    </div>
                </div>
                
                <div class="footer">© 2026 kamado | Nezuko Bot</div>
            </div>

            <script>
                function switchTab(sectionId, btn) {
                    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
                    document
