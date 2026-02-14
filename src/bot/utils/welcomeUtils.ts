export function getAestheticWelcomeMessage(userId: string) {
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '.');
    
    return `
᭥ 𝗐 𝖾 𝗅 𝖼 𝗈 𝗆 𝖾 🌸 🌊 
ʚɞ  ᐢ .. ᐢ   **Sen Nightcore**   Theme

${dateStr} —— **Must Read Rules!**

# 1 › ୨୧  Follow Discord's ToS && GL
# 2 › 🎧  Share your favorite Nightcore !!
# 3 › 🐚  Be kind to all music lovers
# 4 › 🌙  No drama, just pure vibes !!

︶︶︶︶︶︶︶︶︶︶︶︶︶︶︶︶︶︶︶︶︶

**We're so happy to see you :D**
ʚɞ   ૮꒰ ˶• ༝ •˶꒱ა    <@${userId}>  ++  **Welcome!**
`;
}

export function getAestheticDM(guildName: string) {
    return `
🌸 **Welcome to ${guildName}!** 🌸

᭥ 𝗐 𝖾 𝗅 𝖼 𝗈 𝗆 𝖾 ʚɞ ᐢ .. ᐢ

We are so glad to have you in **Sen Nightcore**. 
Xya is here to make your stay magical! 

**Quick Tips:**
✨ Use \`/help\` to see my commands.
💎 Claim your \`/daily\` gems.
🎧 Join a voice channel and mention my name to chat!

Please make sure to read the rules in the server. 
Hope you have a lovely time! ♪
`;
}
