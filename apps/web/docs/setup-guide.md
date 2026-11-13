# RAG Chatbot Setup Guide

## Complete Step-by-Step Instructions

This guide walks you through the remaining steps to get your Atomic Habits AI
chatbot fully operational.

---

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Access to a PDF copy of "Atomic Habits" by James Clear
- [ ] A Cloudflare account with Workers AI enabled
- [ ] Terminal access to both repositories

---

## Step 1: Create Pinecone Account and Index

### 1.1 Sign Up for Pinecone

1. Go to [https://www.pinecone.io/](https://www.pinecone.io/)
2. Click **"Start Free"** or **"Sign Up"**
3. Create an account using email or OAuth (Google/GitHub)
4. Verify your email if required

### 1.2 Create the Vector Index

1. Once logged in, click **"Create Index"** in the dashboard
2. Configure the index with these **exact** settings:

| Setting        | Value                     | Why                                         |
| -------------- | ------------------------- | ------------------------------------------- |
| **Index Name** | `atomic-habits`           | Must match code in `chat.service.ts`        |
| **Dimensions** | `768`                     | Matches BGE Base EN v1.5 embedding size     |
| **Metric**     | `cosine`                  | Best for semantic similarity                |
| **Cloud**      | `AWS`                     | Most reliable, best Pinecone support        |
| **Region**     | `us-east-1` (N. Virginia) | Closest to Cloudflare Workers AI processing |

> **Why AWS us-east-1?** Cloudflare Workers AI primarily processes requests in
> US data centers. Choosing `us-east-1` minimizes the roundtrip latency between
> your Worker and Pinecone. 3. Click **"Create Index"** 4. Wait for the index to
> be ready (usually 30-60 seconds)

### 1.3 Get Your API Key

1. In the Pinecone dashboard, click **"API Keys"** in the left sidebar
2. You'll see a default API key, or click **"Create API Key"**
3. Copy the API key and save it securely

> **Important**: Keep this key secret! Never commit it to git.

---

## Step 2: Get Cloudflare API Credentials

### 2.1 Find Your Account ID

1. Go to [https://dash.cloudflare.com/](https://dash.cloudflare.com/)
2. Click on any zone/domain (or Workers if you have no domains)
3. Look at the URL: `https://dash.cloudflare.com/ACCOUNT_ID/...`
4. Copy the `ACCOUNT_ID` portion

**Alternative method:**

1. Go to Workers & Pages
2. On the right sidebar, find **"Account ID"**
3. Copy it

### 2.2 Create an API Token

1. Go to
   [https://dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click **"Create Token"**
3. Click **"Use template"** next to **"Edit Cloudflare Workers"**
4. Under **"Account Resources"**, select your account
5. Under **"Zone Resources"**, you can select "All zones" or specific zones
6. Add an additional permission:
   - **Account** → **Workers AI** → **Read** (or Edit)
7. Click **"Continue to summary"**
8. Click **"Create Token"**
9. **Copy the token immediately** — you won't be able to see it again!

---

## Step 3: Prepare Your Environment

### 3.1 Navigate to Backend Repository

```bash
cd /Users/jayvicsanantonio/Developer/tracknstick-api
```

### 3.2 Create the Data Directory

```bash
mkdir -p data
```

### 3.3 Set Environment Variables

Open a terminal and set these variables for the current session:

```bash
# Replace with your actual values
export CLOUDFLARE_ACCOUNT_ID="your_cloudflare_account_id_here"
export CLOUDFLARE_API_TOKEN="your_cloudflare_api_token_here"
export PINECONE_API_KEY="your_pinecone_api_key_here"
```

> **Tip**: You can verify they're set by running:
>
> ```bash
> echo $CLOUDFLARE_ACCOUNT_ID
> echo $PINECONE_API_KEY
> ```

---

## Step 4: Ingest the Atomic Habits PDF

### 4.1 Run the Ingestion Script

```bash
npx tsx scripts/ingest-atomic-habits.ts /path/to/your/atomic-habits.pdf
```

Replace `/path/to/your/atomic-habits.pdf` with the actual path to your PDF file.

**Example:**

```bash
npx tsx scripts/ingest-atomic-habits.ts ~/Downloads/Atomic_Habits.pdf
```

### 4.2 Expected Output

```
 Reading PDF: /path/to/atomic-habits.pdf
 Extracted 450,000 characters from PDF
 Created 892 chunks (avg 504 chars/chunk)
 Saved chunks to data/chunks.json
 Saved metadata to data/chunks-metadata.json

 Step 1 complete! Next steps:
...
```

### 4.3 Verify the Chunks (Optional)

You can review the chunked content:

```bash
# View first few chunks
head -100 data/chunks.json

# Check metadata
cat data/chunks-metadata.json
```

---

## Step 5: Generate Embeddings and Upload to Pinecone

### 5.1 Run the Embedding Script

```bash
npx tsx scripts/generate-embeddings.ts
```

### 5.2 Expected Output

```
 Loaded 892 chunks from data/chunks.json
 Connecting to Pinecone index: atomic-habits

 Generating embeddings and uploading to Pinecone...
    Upserted 10/892 (1%)
    Upserted 20/892 (2%)
   ...
    Upserted 892/892 (100%)

 All vectors uploaded to Pinecone!
```

### 5.3 Verify in Pinecone Dashboard

1. Go to your Pinecone dashboard
2. Click on the `atomic-habits` index
3. Check that the vector count matches your chunk count

---

## Step 6: Configure Production Secrets

### 6.1 Set the Pinecone API Key Secret

```bash
cd /Users/jayvicsanantonio/Developer/tracknstick-api

# This will prompt you to enter the key
wrangler secret put PINECONE_API_KEY
```

When prompted, paste your Pinecone API key and press Enter.

### 6.2 Verify Your Secrets

```bash
wrangler secret list
```

You should see:

```
 Listing secrets for script "tracknstick-api"
CLERK_SECRET_KEY: ****
PINECONE_API_KEY: ****
```

---

## Step 7: Deploy the Backend

### 7.1 Build and Deploy

```bash
cd /Users/jayvicsanantonio/Developer/tracknstick-api

# Build TypeScript
pnpm run build

# Deploy to Cloudflare Workers
wrangler deploy
```

### 7.2 Expected Output

```
 wrangler 4.x.x
-------------------
Total Upload: XXX KiB / gzip: XX KiB
Uploaded tracknstick-api (X.XX sec)
Published tracknstick-api (X.XX sec)
  https://tracknstick-api.YOUR_SUBDOMAIN.workers.dev
```

---

## Step 8: Test the Chat Endpoint

### 8.1 Test via cURL

Replace `YOUR_API_URL` with your Workers URL and `YOUR_CLERK_TOKEN` with a valid
auth token:

```bash
curl -X POST https://YOUR_API_URL/api/v1/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "messages": [
      {"role": "user", "content": "What are the Four Laws of Behavior Change?"}
    ]
  }'
```

### 8.2 Test via Frontend

1. Start your frontend:

   ```bash
   cd /Users/jayvicsanantonio/Developer/tracknstick.com
   pnpm dev
   ```

2. Open your browser to `http://localhost:5173/chat`

3. Try these test questions:

   - "What are the Four Laws of Behavior Change?"
   - "How do I start a new habit?"
   - "What is habit stacking?"
   - "How can I break a bad habit?"

4. Try an off-topic question to verify guardrails:
   - "What stocks should I buy?" (should politely decline)

---

## Troubleshooting

### Issue: "Pinecone index not found"

**Cause**: Index name mismatch or index not created.

**Fix**:

1. Check your Pinecone dashboard for the exact index name
2. Ensure it matches `atomic-habits` in `chat.service.ts`

### Issue: "Unauthorized" errors

**Cause**: Missing or incorrect Clerk token.

**Fix**:

1. Ensure you're logged in on the frontend
2. Check that `CLERK_SECRET_KEY` is set via `wrangler secret`

### Issue: Empty responses from chat

**Cause**: No vectors in Pinecone or embedding mismatch.

**Fix**:

1. Check Pinecone dashboard for vector count
2. Re-run the embedding script if needed
3. Check Workers logs: `wrangler tail`

### Issue: "Workers AI error"

**Cause**: AI binding not configured.

**Fix**:

1. Check `wrangler.toml` has the `[ai]` section
2. Redeploy: `wrangler deploy`

---

## Quick Reference Commands

```bash
# Navigate to backend
cd /Users/jayvicsanantonio/Developer/tracknstick-api

# Set environment variables
export CLOUDFLARE_ACCOUNT_ID="..."
export CLOUDFLARE_API_TOKEN="..."
export PINECONE_API_KEY="..."

# Run ingestion
npx tsx scripts/ingest-atomic-habits.ts /path/to/book.pdf

# Generate embeddings
npx tsx scripts/generate-embeddings.ts

# Set production secret
wrangler secret put PINECONE_API_KEY

# Deploy
wrangler deploy

# View logs
wrangler tail

# List secrets
wrangler secret list
```

---

## Success Checklist

After completing all steps, verify:

- [ ] Pinecone index created with 768 dimensions
- [ ] PDF chunks saved to `data/chunks.json`
- [ ] Embeddings uploaded to Pinecone (check dashboard)
- [ ] `PINECONE_API_KEY` secret set in Workers
- [ ] Backend deployed successfully
- [ ] Chat works at `/chat` route in frontend
- [ ] Chatbot answers Atomic Habits questions correctly
- [ ] Chatbot politely declines off-topic questions

---

## Next Steps (Optional Enhancements)

1. **Add navigation link** to chat in your app's sidebar/header
2. **Implement chat history** persistence per user
3. **Add streaming indicators** for better UX
4. **Monitor usage** via Cloudflare analytics
5. **Fine-tune chunking** if retrieval quality needs improvement
