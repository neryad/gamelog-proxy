# gamelog-proxy

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://gamelog-proxy.vercel.app)
[![Node.js](https://img.shields.io/badge/Node.js-Serverless-green?logo=node.js)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🔍 What is this?

**gamelog-proxy** is a minimal Vercel serverless proxy that sits between the [Playlogged](https://github.com/your-username/playlogged) mobile app and the [IGDB API](https://api-docs.igdb.com/). The IGDB API requires a Twitch OAuth2 token for every request — a secret that cannot be safely embedded in a mobile client. This proxy handles token acquisition server-side using the Twitch client credentials flow, injects the required auth headers, and forwards the request to IGDB, keeping all credentials out of the app.

---

## 📡 Endpoint

### `POST /api/games`

Proxies a game search query to the IGDB `/games` endpoint.

| Property      | Value                                    |
|---------------|------------------------------------------|
| Method        | `POST`                                   |
| URL           | `https://gamelog-proxy.vercel.app/api/games` |
| Content-Type  | `text/plain`                             |

**Request body**

The body is an [Apicalypse](https://apicalypse.io/) query string passed directly to IGDB.

```
fields name, cover.url, first_release_date, genres.name;
search "zelda";
limit 10;
```

**Example request**

```bash
curl -X POST https://gamelog-proxy.vercel.app/api/games \
  --data 'fields name, cover.url, first_release_date; search "zelda"; limit 5;'
```

**Example response**

```json
[
  {
    "id": 1025,
    "name": "The Legend of Zelda: Ocarina of Time",
    "cover": { "url": "//images.igdb.com/igdb/image/upload/t_thumb/co1yyd.jpg" },
    "first_release_date": 909014400
  }
]
```

---

## 🔑 Environment Variables

| Variable              | Description                                          |
|-----------------------|------------------------------------------------------|
| `TWITCH_CLIENT_ID`    | Your Twitch application's client ID                  |
| `TWITCH_CLIENT_SECRET`| Your Twitch application's client secret              |

Obtain these by registering an application at [dev.twitch.tv](https://dev.twitch.tv/console/apps).

---

## 🛠 Local Development

1. **Install the Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Clone the repo and install dependencies**

   ```bash
   git clone https://github.com/your-username/gamelog-proxy.git
   cd gamelog-proxy
   npm install
   ```

3. **Create a local environment file**

   ```bash
   # .env.local
   TWITCH_CLIENT_ID=your_client_id_here
   TWITCH_CLIENT_SECRET=your_client_secret_here
   ```

4. **Run locally**

   ```bash
   vercel dev
   ```

   The proxy will be available at `http://localhost:3000/api/games`.

---

## 🚀 Deploy to Vercel

1. **Push your code to GitHub** (or GitLab / Bitbucket).

2. **Import the project on Vercel**

   Go to [vercel.com/new](https://vercel.com/new), select your repository, and click **Deploy**.

3. **Add environment variables**

   In your Vercel project dashboard, go to **Settings → Environment Variables** and add:
   - `TWITCH_CLIENT_ID`
   - `TWITCH_CLIENT_SECRET`

4. **Redeploy** (if variables were added after the initial deploy)

   ```bash
   vercel --prod
   ```

That's it — Vercel automatically detects the `api/` folder and deploys `games.js` as a serverless function.

---

## 🔗 Related Projects

- **Playlogged** — the React Native mobile app this proxy serves: [github.com/your-username/playlogged](https://github.com/your-username/playlogged)

---

## 📄 License

MIT © [Your Name](https://github.com/your-username)
