import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')"
      }}
    >
      <div>
        <SignIn />
      </div>
    </div>
  )
}

