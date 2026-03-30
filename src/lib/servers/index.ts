import { registerGoogleServer } from './google';
import { registerGHLServer } from './ghl';
import { registerKlaviyoServer } from './klaviyo';
import { registerMetaServer } from './meta';
import { registerZoomServer } from './zoom';
import { registerQuickBooksServer } from './quickbooks';
import { registerStripeServer } from './stripe';
import { registerVercelServer } from './vercel';
import { registerNanoBananaServer } from './nanobanana';

let initialized = false;

export function ensureServersRegistered() {
  if (initialized) return;
  initialized = true;

  registerGoogleServer();
  registerGHLServer();
  registerKlaviyoServer();
  registerMetaServer();
  registerZoomServer();
  registerQuickBooksServer();
  registerStripeServer();
  registerVercelServer();
  registerNanoBananaServer();
}
