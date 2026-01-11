import type { RequestHandler } from 'express';
import { Webhook } from 'svix';
import { prisma } from '../config/database.js';
import { config } from '../config/index.js';
import { AppError } from '../utils/errors.js';

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string }>;
    first_name?: string;
    last_name?: string;
    image_url?: string;
  };
}

/**
 * Handle Clerk webhook events
 * Syncs user data from Clerk to our database
 */
export const handleClerkWebhook: RequestHandler = async (req, res, next) => {
  console.log('Webhook received:', req.headers['svix-id']);

  try {
    const webhookSecret = config.clerk.webhookSecret;

    if (!webhookSecret) {
      throw AppError.internal('Clerk webhook secret not configured');
    }

    // Verify webhook signature
    const svixId = req.headers['svix-id'] as string;
    const svixTimestamp = req.headers['svix-timestamp'] as string;
    const svixSignature = req.headers['svix-signature'] as string;

    if (!svixId || !svixTimestamp || !svixSignature) {
      throw AppError.badRequest('Missing webhook headers');
    }

    const wh = new Webhook(webhookSecret);
    let event: ClerkWebhookEvent;

    try {
      // Use raw body for signature verification (preserved by express.json verify option)
      const rawBody = (req as typeof req & { rawBody?: Buffer }).rawBody;
      const bodyString = rawBody ? rawBody.toString() : JSON.stringify(req.body);

      event = wh.verify(bodyString, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as ClerkWebhookEvent;
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      throw AppError.badRequest('Invalid webhook signature');
    }

    console.log('Webhook event verified:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'user.created':
      case 'user.updated': {
        const { id: clerkId, email_addresses, first_name, last_name, image_url } = event.data;

        const email = email_addresses?.[0]?.email_address;
        const name = [first_name, last_name].filter(Boolean).join(' ') || 'User';

        await prisma.user.upsert({
          where: { clerkId },
          create: {
            clerkId,
            email,
            name,
            avatarUrl: image_url,
          },
          update: {
            email,
            name,
            avatarUrl: image_url,
          },
        });

        break;
      }

      case 'user.deleted': {
        const { id: clerkId } = event.data;

        await prisma.user.delete({
          where: { clerkId },
        }).catch(() => {
          // User might not exist, ignore
        });

        break;
      }

      default:
        // Ignore unknown events
        console.log(`Unhandled webhook event: ${event.type}`);
    }

    res.json({ success: true, received: true });
  } catch (error) {
    next(error);
  }
};
