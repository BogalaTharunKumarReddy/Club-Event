/**
 * Thin wrapper around Razorpay Checkout — the hosted card / UPI / netbanking modal.
 *
 * Only non-secret values ever reach the browser: the publishable key id and the order id, both
 * supplied by our server. The Razorpay secret key stays server-side and signs/verifies payments
 * there. The checkout script is loaded lazily on first use, so free events and the mock gateway
 * never pay its cost.
 */

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

export interface RazorpayCheckoutOptions {
  /** Publishable key id (rzp_test_* / rzp_live_*). Never the secret key. */
  key: string;
  /** Order id returned by our server's /payments/initiate (the payment's providerReference). */
  orderId: string;
  /** Amount in major units (e.g. rupees); Razorpay wants minor units, converted here. */
  amount: number;
  currency: string;
  name: string;
  description?: string;
  prefillName?: string;
  prefillEmail?: string;
}

export interface RazorpayCheckoutResult {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

/** Thrown when the user closes the checkout modal without paying — a cancel, not an error. */
export class RazorpayDismissedError extends Error {
  constructor() {
    super('Payment cancelled.');
    this.name = 'RazorpayDismissedError';
  }
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
}

type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadCheckoutScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const fail = () => {
      scriptPromise = null;
      reject(new Error('Failed to load the payment window. Check your connection and try again.'));
    };
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CHECKOUT_SRC}"]`);
    if (existing) {
      if (window.Razorpay) {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', fail);
      return;
    }
    const script = document.createElement('script');
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = fail;
    document.body.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Open the Razorpay Checkout modal for a previously created order. Resolves with the payment id +
 * signature to hand back to the server for verification, or rejects with a {@link RazorpayDismissedError}
 * if the user closes the modal (and a plain Error for load/failure cases).
 */
export async function openRazorpayCheckout(
  options: RazorpayCheckoutOptions,
): Promise<RazorpayCheckoutResult> {
  await loadCheckoutScript();
  const RazorpayCtor = window.Razorpay;
  if (!RazorpayCtor) {
    throw new Error('The payment window is unavailable. Please try again.');
  }

  return new Promise<RazorpayCheckoutResult>((resolve, reject) => {
    let settled = false;

    const rzp = new RazorpayCtor({
      key: options.key,
      order_id: options.orderId,
      amount: Math.round(options.amount * 100),
      currency: options.currency,
      name: options.name,
      description: options.description,
      prefill: {
        name: options.prefillName,
        email: options.prefillEmail,
      },
      handler: (response: unknown) => {
        settled = true;
        const r = (response ?? {}) as Partial<RazorpayCheckoutResult>;
        if (r.razorpay_payment_id && r.razorpay_order_id && r.razorpay_signature) {
          resolve({
            razorpay_payment_id: r.razorpay_payment_id,
            razorpay_order_id: r.razorpay_order_id,
            razorpay_signature: r.razorpay_signature,
          });
        } else {
          reject(new Error('The payment could not be confirmed. Please try again.'));
        }
      },
      modal: {
        ondismiss: () => {
          if (!settled) reject(new RazorpayDismissedError());
        },
      },
    });

    rzp.on('payment.failed', (response: unknown) => {
      settled = true;
      const err = (response ?? {}) as { error?: { description?: string } };
      reject(new Error(err.error?.description ?? 'The payment failed. Please try again.'));
    });

    rzp.open();
  });
}
