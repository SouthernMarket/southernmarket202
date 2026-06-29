import { timingSafeEqual } from 'crypto';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { password } = req.body;

  // Must have a password attempt in the request
  if (typeof password !== 'string' || !password) {
    return res.status(400).json({ success: false });
  }

  // Read the real password from Vercel environment — never from the client
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('ADMIN_PASSWORD is not set in environment variables');
    return res.status(500).json({ success: false, error: 'Server misconfiguration' });
  }

  // Timing-safe comparison — prevents attackers from guessing the password
  // one character at a time by measuring how long the check takes
  let match = false;
  try {
    const a = Buffer.from(password);
    const b = Buffer.from(adminPassword);
    // timingSafeEqual requires equal-length buffers — if lengths differ, it's wrong
    if (a.length === b.length) {
      match = timingSafeEqual(a, b);
    }
  } catch {
    match = false;
  }

  if (match) {
    return res.status(200).json({ success: true });
  } else {
    // Small delay on failure to slow down brute-force attempts
    await new Promise(r => setTimeout(r, 400));
    return res.status(200).json({ success: false });
  }
}
