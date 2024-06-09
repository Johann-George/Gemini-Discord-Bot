import dotenv from "dotenv";

import discord from "discord.js" ;

import { GoogleGenerativeAI } from "@google/generative-ai";
dotenv.config({path: './.env.local'});
const API_KEY=process.env.API_KEY;

const BOT_TOKEN=process.env.BOT_TOKEN;

const CHANNEL_ID=process.env.CHANNEL_ID;

const ai=new GoogleGenerativeAI(API_KEY);
const model=ai.getGenerativeModel({model:"gemini-pro"});

const client = new discord.Client({
    intents: Object.keys(discord.GatewayIntentBits),
});

client.on("ready",()=>{
    console.log("Bot is ready");
});

client.login(BOT_TOKEN);

client.on('messageCreate', async (message)=>{
    try{
        if(message.author.bot) return;
        if(message.channel.id!= CHANNEL_ID) return;
        const prefix = '!'; // Define your command prefix
        if (!message.content.startsWith(prefix)) return; // Ignore messages without the prefix
        
        const command = message.content.slice(prefix.length).trim().split(/ +/).shift().toLowerCase();
        if(command==='explain'){
            const {response}=await model.generateContent(message.cleanContent)
            const text = response.text(); // Assuming response.text() is the text you want to send
            const textChunks = splitIntoChunks(text, MAX_LENGTH);

            for (const chunk of textChunks) {
            await message.reply({
                content: chunk,
            });
            }
        }
        if(command==='factcheck'){
            const factToCheck = message.content.slice('!factcheck'.length).trim();
            const prompt = `You are a fact checker bot. Could you check whether this fact is true? "${factToCheck}"`;

            try {
                // Send the prompt to the AI API
                const response = await axios.post(AI_API_URL, {
                prompt: prompt,
                max_tokens: 50, // Customize based on how long of a response you want
                // Other parameters as required by the AI service
                }, {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                },
                });

                // Assuming the response contains a field `data` with the AI's text response
                const aiResponse = response.data.data;

                // Send the result to the Discord channel
                message.reply(`Fact Check Result: ${aiResponse}`);
            } catch (error) {
                console.error(error);
                message.reply('An error occurred while trying to fact-check the statement.');
            }
        }
        
    }
    catch(e){
        console.log(e);
    }
})

const MAX_LENGTH = 2000; // Discord's max length for messages

// Helper function to split text into chunks
function splitIntoChunks(text, maxLength) {
  const chunks = [];
  while (text.length > 0) {
    const chunk = text.slice(0, maxLength);
    chunks.push(chunk);
    text = text.slice(maxLength);
  }
  return chunks;
}