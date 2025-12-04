# How to Implement Real OTP Authentication

To switch from the current "Mock" OTP to real SMS-based OTP using Supabase, follow these steps.

## 1. Supabase Dashboard Configuration

You need to enable the Phone provider and configure an SMS sender.

1.  **Log in to Supabase Dashboard** and go to your project.
2.  Navigate to **Authentication** -> **Providers**.
3.  Select **Phone**.
4.  Toggle **Enable Phone Provider**.
5.  **SMS Provider Setup**:
    *   By default, Supabase gives you a few free SMS for testing, but for production, you need a provider like **Twilio**, **MessageBird**, or **Vonage**.
    *   **Twilio Example**:
        *   Sign up for Twilio and get a Phone Number.
        *   Get your **Account SID**, **Auth Token**, and **Message Service SID**.
        *   Enter these credentials in the Supabase Phone Provider settings.
6.  Click **Save**.

## 2. Code Changes

We need to update the application to use Supabase Auth methods instead of the `MockService`.

### A. Update `lib/auth-service.ts` (New File)

Create a new service to handle Supabase Auth interactions.

```typescript
import { supabase } from './supabase';

export const AuthService = {
  // Step 1: Send OTP
  signInWithOtp: async (phone: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
    });
    return { data, error };
  },

  // Step 2: Verify OTP
  verifyOtp: async (phone: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    return { data, error };
  },

  // Get current session
  getSession: async () => {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },
  
  // Sign out
  signOut: async () => {
    await supabase.auth.signOut();
  }
};
```

### B. Update `app/onboarding/page.tsx`

Modify the `handleNext` function to call `AuthService`.

```typescript
// ... imports

const handleNext = async () => {
    if (step === 1) {
        // Send Real OTP
        const { error } = await AuthService.signInWithOtp(formData.phone);
        if (error) {
            alert('Error sending OTP: ' + error.message);
            return;
        }
    }
    if (step === 2) {
        // Verify Real OTP
        const { data, error } = await AuthService.verifyOtp(formData.phone, formData.otp);
        if (error) {
            alert('Invalid OTP');
            return;
        }
        // Auth successful! 'data.session' contains the user.
    }
    setStep(prev => prev + 1);
};
```

### C. Database Trigger (Optional but Recommended)

When a user signs up via Auth, they are created in `auth.users`. You might want to automatically create a record in your `public.users` table.

You can create a Postgres Function and Trigger in the Supabase SQL Editor:

```sql
-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, phone)
  values (new.id, new.phone);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## 3. Testing

Once configured:
1.  Enter a real phone number in the app.
2.  You should receive an actual SMS code.
3.  Enter that code to login.
