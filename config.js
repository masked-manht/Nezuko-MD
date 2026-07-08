/**
 * Global Configuration for WhatsApp MD Bot - Nezuko-v1 Custom Edition
 */

module.exports = {
    // Bot Owner Configuration
    ownerNumber: ['5093542014'], // Ton numéro au format international sans espace ni '+'
    ownerName: ['kamado'],       // Ton nom d'owner
    
    // Bot Configuration
    botName: 'Nezuko-v1',
    prefix: '.',
    sessionName: 'session_auth',
    sessionID: process.env.SESSION_ID || '',
    newsletterJid: '120363161513685998@newsletter', // Conserve l'original pour la compatibilité du menu
    updateZipUrl: 'https://github.com/mruniquehacker/KnightBot-Mini/archive/refs/heads/main.zip', // URL d'origine pour les mises à jour
    
    // Sticker Configuration
    packname: 'Nezuko-v1 Pack',
    
    // Bot Behavior
    selfMode: false, // Reste sur false pour que tout le monde puisse utiliser le bot
    autoRead: false,
    autoTyping: false,
    autoBio: true,   // Activé pour afficher fièrement le nom de ton bot en ligne
    autoSticker: false,
    autoReact: false,
    autoReactMode: 'bot',
    autoDownload: false,
    
    // Group Settings Defaults
    defaultGroupSettings: {
      antilink: false,
      antilinkAction: 'delete', // 'delete', 'kick', 'warn'
      antitag: false,
      antitagAction: 'delete'
    }
};
