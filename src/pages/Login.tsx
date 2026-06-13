import { supabase } from '@/lib/supabase';

export default function Login() {
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <button onClick={signInWithGoogle}>
        Sign in with Google
      </button>
    </div>
  );
}