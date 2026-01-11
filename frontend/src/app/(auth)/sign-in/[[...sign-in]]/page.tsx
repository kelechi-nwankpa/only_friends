import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'w-full',
            card: 'w-full shadow-lg',
          },
        }}
      />
    </div>
  );
}
