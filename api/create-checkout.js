export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.error('STRIPE_SECRET_KEY is not set in environment variables');
    return res.status(500).json({ error: 'Payment service not configured' });
  }

  const { title, price, slug } = req.body;

  if (!title || !price || !slug) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Stripe expects price in cents (integer)
  const unitAmount = Math.round(parseFloat(price) * 100);
  if (isNaN(unitAmount) || unitAmount <= 0) {
    return res.status(400).json({ error: 'Invalid price' });
  }

  const baseUrl = 'https://southernmarket202.com';

  // Stripe Checkout API uses form-encoded body, not JSON
  const params = new URLSearchParams({
    'mode': 'payment',
    'line_items[0][price_data][currency]': 'usd',
    'line_items[0][price_data][product_data][name]': title,
    'line_items[0][price_data][unit_amount]': unitAmount,
    'line_items[0][quantity]': '1',
    'success_url': `${baseUrl}/success.html?session_id={CHECKOUT_SESSION_ID}`,
    'cancel_url': `${baseUrl}/item.html?slug=${slug}`,
  });

  try {
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(stripeKey + ':').toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Stripe API error:', data);
      return res.status(500).json({ error: data.error?.message || 'Payment session failed' });
    }

    return res.status(200).json({ url: data.url });

  } catch (err) {
    console.error('create-checkout error:', err);
    return res.status(500).json({ error: 'Something went wrong — please try again' });
  }
}
