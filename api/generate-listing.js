export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Read API key from Vercel environment — NEVER from the request
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY is not set in environment variables');
    return res.status(500).json({ error: 'AI service not configured — contact the site owner' });
  }

  const { imageBase64, mediaType } = req.body;
  if (!imageBase64 || !mediaType) {
    return res.status(400).json({ error: 'Missing image data' });
  }

  // Validate media type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(mediaType)) {
    return res.status(400).json({ error: 'Unsupported image type' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 500,
        system: `You write product listings for Southern Market 202, a family antique and vintage shop in Williamston, South Carolina. The owners personally restore each piece before selling — sanding, staining, refinishing with care.

Your listings are warm, story-driven, and specific. You write like a Southern antique dealer who genuinely loves these pieces — not like a generic e-commerce site. Every item has a history worth telling.

When given a photo, return ONLY a JSON object with these three fields:
- title: A short, evocative name for the item (4–7 words, no brand names unless clearly visible)
- description: 2–4 sentences. Lead with what makes it special — age, character, craftsmanship, or story. Mention the restoration if it looks like work has been done. Write like you're talking to someone at a market, not filling out a form. Warm and genuine.
- suggestedPrice: A number only (no $ sign, no text, no decimals unless needed). Base it on realistic antique/vintage market value for what you see — not retail, not eBay inflated. A fair price someone would actually pay at a Southern antique market.

Return ONLY valid JSON. No markdown code fences, no explanation, no extra text before or after the JSON.`,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: 'Please generate a listing for this antique or vintage item.',
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', response.status, errorText);
      return res.status(500).json({ error: 'AI service error — please try again in a moment' });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text;

    if (!text) {
      console.error('Empty response from Anthropic API');
      return res.status(500).json({ error: 'No response from AI — please try again' });
    }

    // Strip markdown code fences if the model wrapped its JSON in them
    // e.g. ```json\n{...}\n``` or ```\n{...}\n```
    let cleaned = text.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned
        .replace(/^```(?:json)?\s*/i, '')  // remove opening fence
        .replace(/```\s*$/, '')            // remove closing fence
        .trim();
    }

    // Parse the JSON the model returned
    let listing;
    try {
      listing = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse AI response as JSON:', text);
      return res.status(500).json({ error: 'AI returned an unexpected format — please try again' });
    }

    return res.status(200).json({
      title: listing.title || '',
      description: listing.description || '',
      suggestedPrice: listing.suggestedPrice || '',
    });

  } catch (err) {
    console.error('Generate listing error:', err);
    return res.status(500).json({ error: 'Something went wrong — please try again' });
  }
}
