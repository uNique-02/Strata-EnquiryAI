import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED_ROUTES = ["/", "/dashboard", "/settings"];
const REDIRECT_IF_AUTHENTICATED_ROUTES = ["/auth/login", "/auth/signup"];

function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTES.some((route) =>
    route === "/" ? pathname === "/" : pathname.startsWith(route),
  );
}

function isAuthRoute(pathname: string) {
  return REDIRECT_IF_AUTHENTICATED_ROUTES.some((route) => pathname.startsWith(route));
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const protectedRoute = isProtectedRoute(pathname);
  const authRoute = isAuthRoute(pathname);

  if (!user && protectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && authRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}
