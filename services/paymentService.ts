import { Plan, AIPack } from '../types';

declare global {
  interface Window {
    LemonSqueezy: any;
  }
}

export const initLemonSqueezy = () => {
  if (window.LemonSqueezy) {
    window.LemonSqueezy.Setup({
      eventHandler: (event: any) => {
        if (event.event === 'Checkout.Success') {
          console.log('Payment Successful', event.data);
          // O processamento final deve ser feito via Webhook no backend real
        }
      }
    });
  }
};

export const openCheckout = (variantId: string, userEmail: string, userName: string) => {
  if (!window.LemonSqueezy) {
    alert("Payment system is loading. Please try again in a moment.");
    return;
  }

  // URL de checkout direta ou overlay
  // O Lemon Squeezy aceita pre-fill de dados do cliente
  const checkoutUrl = `https://opsflow.lemonsqueezy.com/checkout/buy/${variantId}?checkout[email]=${encodeURIComponent(userEmail)}&checkout[name]=${encodeURIComponent(userName)}`;
  
  window.LemonSqueezy.Url.Open(checkoutUrl);
};
