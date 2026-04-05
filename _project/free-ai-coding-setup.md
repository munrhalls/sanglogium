# Free AI Coding Assistant Setup for VSCode / Windows 11

> Goal: Get back to Next.js / Tailwind development on sang-logium immediately, zero cost.

---

## Top 3 Options (Ranked)

| # | Extension | Backend | Quality | Setup Time |
|---|-----------|---------|---------|------------|
| 🥇 | **Cline** | Google AI Studio (Gemini 2.5 Pro) | ⭐⭐⭐⭐⭐ | ~5 min |
| 🥈 | **Cline** | OpenRouter (free models) | ⭐⭐⭐⭐ | ~5 min |
| 🥉 | **GitHub Copilot Free** | GPT-4o mini (built-in) | ⭐⭐⭐ | ~3 min |

---

## 🥇 BEST OPTION: Cline + Google AI Studio (Gemini 2.5 Pro)

**Why:** Gemini 2.5 Pro has a massive context window (1M tokens), handles full Next.js files easily, and the free tier is genuinely generous. Cline is the most capable open-source AI coding agent for VSCode.

### Step 1 — Get a free Gemini API key

1. Go to [https://aistudio.google.com](https://aistudio.google.com)
2. Sign in with your Google account
3. Click **"Get API key"** → **"Create API key"**
4. Copy the key (starts with `AIza...`)

> Free tier: 1,500 requests/day, 1M token context — more than enough for active dev.

### Step 2 — Install Cline in VSCode

1. Open VSCode
2. Press `Ctrl+Shift+X` to open Extensions
3. Search **"Cline"** (by saoudrizwan)
4. Click **Install**

### Step 3 — Configure Cline

1. Click the Cline icon in the sidebar (robot icon)
2. Click the **gear/settings icon** in the Cline panel
3. Set **API Provider** → `Google Gemini`
4. Paste your API key
5. Set **Model** → `gemini-2.5-pro-exp-03-25` (or latest `gemini-2.5-pro`)
6. Click **Save**

### Step 4 — Verify it works

Open your sang-logium project, then in the Cline chat type:

```
Look at my project structure and tell me what Next.js version I'm using.
```

If it reads your files and responds correctly — you're good to go.

---

## 🥈 BACKUP: Cline + OpenRouter (free models)

Use this if Google AI Studio is unavailable or you hit rate limits.

1. Sign up at [https://openrouter.ai](https://openrouter.ai) (free, no credit card needed for free models)
2. Go to **Keys** → create a new API key
3. In Cline settings: set **API Provider** → `OpenRouter`
4. Paste your key
5. Set model to one of these **free** options:
   - `google/gemini-2.0-flash-exp:free` — fast, capable
   - `meta-llama/llama-4-maverick:free` — strong for code
   - `deepseek/deepseek-chat-v3-0324:free` — excellent at code

> Note: Free models on OpenRouter can have rate limits during peak hours.

---

## 🥉 FALLBACK: GitHub Copilot Free Tier

Microsoft now offers a permanent free tier (no trial, no credit card).

1. Go to [https://github.com/settings/copilot](https://github.com/settings/copilot) and enable Copilot Free
2. In VSCode: install the **GitHub Copilot** extension (`Ctrl+Shift+X` → search "GitHub Copilot")
3. Sign in with your GitHub account when prompted

**Limits:** 2,000 code completions/month + 50 chat messages/month. Fine for targeted use but will run out if you're coding all day.

---

## Tips for sang-logium / Next.js Work

- **Give Cline context upfront:** paste your `package.json` or a component file before asking complex questions
- **Use Cline's "mention" feature:** type `@` in the chat to attach specific files directly
- **For Tailwind work:** ask Cline to reference your `tailwind.config.js` so it respects your theme
- **Rate limit hit?** Switch between Google AI Studio and OpenRouter — you have two free pools

---

## Quick Reference

| Resource | URL |
|----------|-----|
| Google AI Studio | https://aistudio.google.com |
| Cline VSCode Extension | `saoudrizwan.claude-dev` on Marketplace |
| OpenRouter | https://openrouter.ai |
| GitHub Copilot Free | https://github.com/settings/copilot |
