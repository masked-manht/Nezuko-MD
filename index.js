const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const express = require('express');
const QRCode = require('qrcode');
const path = require('path');

const app = express();
const port = process.env.PORT || 10000;

let qrCodeImage = null; // Stocke l'image du QR code en Base64
let botStatus = "En attente de génération du QR Code...";

async function startNezuko() {
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'session'));
    
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true, // Affiche aussi dans la console de Render au cas où
        auth: state
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        // Dès qu'un QR code arrive, on le convertit en image pour le web
        if (qr) {
            try {
                qrCodeImage = await QRCode.toDataURL(qr);
                botStatus = "Scannez le QR Code ci-dessous avec votre application WhatsApp :";
            } catch (err) {
                console.error("Erreur de conversion du QR Code :", err);
            }
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            botStatus = shouldReconnect ? "Déconnecté. Reconnexion automatique en cours..." : "Session expirée. Veuillez réinitialiser le serveur.";
            qrCodeImage = null;
            if (shouldReconnect) startNezuko();
        } else if (connection === 'open') {
            console.log('Nezuko-v1 est connecté avec succès ! ✅');
            botStatus = "Nezuko-v1 est connecté et opérationnel ! ✅";
            qrCodeImage = null; // Plus besoin du QR Code une fois connecté
        }
    });

    // Écoute élémentaire des messages reçus
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            // Ton logique de commandes de bot se place ici
        } catch (err) {
            console.error(err);
        }
    });
}

// --- RENDU DU PANEL WEB SUR RENDER ---
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Nezuko-v1 - Connexion</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; background-color: #0f0f12; color: #ffffff; padding: 40px 20px; }
                .container { background: #18181f; padding: 40px; border-radius: 20px; display: inline-block; box-shadow: 0 10px 30px rgba(0,0,0,0.7); max-width: 90%; }
                h1 { color: #ff4a5a; font-size: 2.2em; margin-bottom: 5px; }
                .subtitle { color: #6f6f7f; margin-bottom: 30px; font-size: 1.1em; }
                .status { font-weight: bold; font-size: 1.2em; color: #e0e0e6; background: #23232e; padding: 12px; border-radius: 10px; border: 1px solid #2e2e3e; display: inline-block; }
                .qr-box { margin-top: 30px; }
                img { background: white; padding: 15px; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); width: 250px; height: 250px; }
                .footer { margin-top: 40px; color: #4e4e5e; font-size: 0.9em; }
            </style>
            <script>
                // Actualisation automatique de la page toutes les 5 secondes pour mettre à jour le statut et le QR Code
                setInterval(() => { window.location.reload(); }, 5000);
            </script>
        </head>
        <body>
            <div class="container">
                <h1>Nezuko-v1</h1>
                <div class="subtitle">Gestionnaire de déploiement WhatsApp</div>
                <div class="status">${botStatus}</div>
                
                ${qrCodeImage ? `
                <div class="qr-box">
                    <img src="${qrCodeImage}" alt="QR Code WhatsApp"><br>
                    <p style="color: #ff4a5a; font-size: 0.9em; margin-top: 15px;">Le code change régulièrement, scannez-le rapidement.</p>
                </div>
                ` : ''}
                
                <div class="footer">Nezuko Bot Project — Hébergé avec succès sur Render</div>
            </div>
        </body>
        </html>
    `);
});

// Lancement du serveur Web Express
app.listen(port, () => {
    console.log(`Serveur Web actif sur le port standard : ${port}`);
});

// Démarrage du bot WhatsApp
startNezuko();
