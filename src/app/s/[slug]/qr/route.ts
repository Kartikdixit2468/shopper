import QRCode from "qrcode";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const store = await prisma.store.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { name: true },
  });
  if (!store) return new Response("Not found", { status: 404 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || new URL(request.url).origin;
  const url = new URL(`/s/${slug}`, siteUrl).toString();
  const svg = await QRCode.toString(url, {
    type: "svg",
    width: 900,
    margin: 3,
    color: { dark: "#17211F", light: "#FFFFFF" },
  });
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}-qr.svg"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
