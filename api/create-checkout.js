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

    // Collect shipping address from the customer
    'shipping_address_collection[allowed_countries][0]': 'US',

    // Shipping option 0 — Free Local Pickup
    'shipping_options[0][shipping_rate_data][type]': 'fixed_amount',
    'shipping_options[0][shipping_rate_data][display_name]': 'Local Pickup (Williamston, SC)',
    'shipping_options[0][shipping_rate_data][fixed_amount][amount]': '0',
    'shipping_options[0][shipping_rate_data][fixed_amount][currency]': 'usd',

    // Shipping option 1 — Standard Shipping (5–7 days) $8.99
    'shipping_options[1][shipping_rate_data][type]': 'fixed_amount',
    'shipping_options[1][shipping_rate_data][display_name]': 'Standard Shipping (5–7 business days)',
    'shipping_options[1][shipping_rate_data][fixed_amount][amount]': '899',
    'shipping_options[1][shipping_rate_data][fixed_amount][currency]': 'usd',
    'shipping_options[1][shipping_rate_data][delivery_estimate][minimum][unit]': 'business_day',
    'shipping_options[1][shipping_rate_data][delivery_estimate][minimum][value]': '5',
    'shipping_options[1][shipping_rate_data][delivery_estimate][maximum][unit]': 'business_day',
    'shipping_options[1][shipping_rate_data][delivery_estimate][maximum][value]': '7',

    // Shipping option 2 — Priority Mail (2–3 days) $14.99
    'shipping_options[2][shipping_rate_data][type]': 'fixed_amount',
    'shipping_options[2][shipping_rate_data][display_name]': 'Priority Mail (2–3 business days)',
    'shipping_options[2][shipping_rate_data][fixed_amount][amount]': '1499',
    'shipping_options[2][shipping_rate_data][fixed_amount][currency]': 'usd',
    'shipping_options[2][shipping_rate_data][delivery_estimate][minimum][unit]': 'business_day',
    'shipping_options[2][shipping_rate_data][delivery_estimate][minimum][value]': '2',
    'shipping_options[2][shipping_rate_data][delivery_estimate][maximum][unit]': 'business_day',
    'shipping_options[2][shipping_rate_data][delivery_estimate][maximum][value]': '3',
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
