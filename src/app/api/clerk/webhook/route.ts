import { supabase } from '@/lib/supabase';

// /api/clerk/webhook
export const POST = async (req: Request) => {
  try {
    // Parse the incoming request body
    const { data, type } = await req.json();

    console.log('Clerk webhook received', { type, data });

    // Handle user creation
    if (type === 'user.created') {
      const { id: clerkUserId, email_addresses, first_name, last_name } = data;

      const email = email_addresses?.[0]?.email_address || '';
      const name = `${first_name || ''} ${last_name || ''}`.trim();
      const role = 'admin'; // Default role for new users

      // Insert user into Supabase `users` table
      const { error } = await supabase.from('users').insert([
        {
          email,
          name,
          role,
          clerk_user_id: clerkUserId,
          organization_id: null, // Update later if associated with an organization
        },
      ]);

      if (error) {
        console.error('Error inserting user into Supabase:', error);
        return new Response('Error inserting user into database', { status: 500 });
      }

      console.log('User inserted successfully into Supabase');
    }

    // Handle organization creation
    if (type === 'organization.created') {
      const { id: clerkOrgId, name: organizationName, created_by } = data;

      // Insert organization into Supabase `organizations` table
      const { error } = await supabase.from('organizations').insert([
        {
          id: clerkOrgId,
          name: organizationName,
          owner_id: created_by, // Clerk user ID of the organization creator
        },
      ]);

      if (error) {
        console.error('Error inserting organization into Supabase:', error);
        return new Response('Error inserting organization into database', { status: 500 });
      }

      console.log('Organization inserted successfully into Supabase');
    }

    // Return a success response
    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
};
