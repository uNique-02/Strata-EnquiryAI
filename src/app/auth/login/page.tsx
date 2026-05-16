import { AuthForm } from "@/components/auth-form";

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const nextPath = params.next && params.next.startsWith("/") ? params.next : "/";

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <AuthForm mode="login" nextPath={nextPath} />
    </main>
  );
}
