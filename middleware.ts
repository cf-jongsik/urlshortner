export const runtime = "experimental-edge";

import { NextResponse, NextRequest } from "next/server";
import { GetUrl } from "@/app/actions/kv";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname.replace("/", "");
  try {
    const res = await GetUrl(path);
    console.log({ path: path, res: res });
    if (res && res.length > 0) {
      const url = new URL(res as string);
      console.log({ url: url });
      return NextResponse.redirect(new URL(url));
    }
  } catch (e) {
    console.error(e);
    return NextResponse.next();
  }
}

export const config = {
  matcher: "/((?!admin|actions$).+)",
};
