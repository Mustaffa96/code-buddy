# Coding Buddy

A beautiful, performant, and free AI-powered coding assistant web app, leveraging Claude (Sonnet 4) via [Puter.js](https://developer.puter.com/tutorials/free-unlimited-claude-35-sonnet-api/). No API keys or backend required.

## Features

- **Unlimited, free Claude AI access** (Sonnet 4, Opus 4)
- **Modern, beautiful UI** (optimized for CLS and LCP)
- **Zero-lint, SOLID, clean architecture**
- **Fast, streaming responses**
- **Mobile responsive**
- **Clear chat button to reset the conversation**
- **Export chat button to download your conversation as a Markdown (.md) file**
- **No sign-up, no server, no cost**
- **Greeting modal on first load** with instructions to register/login at puter.com and support Puter.

## Usage

1. Open `index.html` in your browser.
2. Type your coding question or prompt.
3. Click **Send** to get instant, streaming answers from Claude.
4. Click **Clear** to reset the chat area and start a new conversation.
5. Click **Export Chat** to download your conversation as a Markdown (.md) file.

## Architecture

- **HTML/CSS/JS only** (no build step)
- **Clean architecture**: UI, service, and controller layers
- **SOLID principles**: Each class has a single responsibility
- **Fully commented code**

## Claude API via Puter.js

- Uses [Puter.js](https://js.puter.com/v2/) for free Claude access
- No API keys or backend needed
- Supports both Sonnet 4 and Opus 4 models

## Design & Performance

- Optimized for Cumulative Layout Shift (CLS) and Largest Contentful Paint (LCP)
- Beautiful, accessible, and responsive UI
- Fast load, minimal dependencies

## File Structure

- `index.html` – Main app UI
- `style.css` – App styles
- `app.js` – App logic (SOLID, clean, commented)

## Customization

- Change Claude model in `app.js` (`ClaudeService` constructor)
- Tweak styles in `style.css`

## License

MIT

### Greeting Modal

On first load, a modal will appear with a greeting and instructions:

1. Please register/login at puter.com.
2. Happy coding! Don’t forget to support Puter by subscribing to their plan.

### Gundam Theme

The UI is styled with a Gundam-inspired color palette:

- **Blue** (#1976d2), **Red** (#e53935), **Yellow** (#ffd600), **White** (#f5f7fa), and **Metallic Gray** (#b0bec5)
- Buttons, chat bubbles, avatars, and modal all reflect this theme
- You can further customize the theme by editing CSS variables in `style.css`
- Fully responsive and mobile-friendly layout for all devices
