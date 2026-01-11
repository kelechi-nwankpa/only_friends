import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center">
      <SignUp
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
