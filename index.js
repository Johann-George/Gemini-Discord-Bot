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

            await message.reply({
                content:response.text(),
            });
        }
        
    }
    catch(e){
        console.log(e);
    }
})