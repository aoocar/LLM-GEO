import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * 共享 OG 图渲染器：用 next/og 生成 1200x630 品牌图（构建期产出静态 PNG）。
 * 中文字体为子集化后的 Noto Sans SC（assets/fonts/NotoSansSC.ttf），
 * 见 memory 说明：字体必须进仓库（Vercel=Linux 无系统中文字体），且仅含当前站点用字。
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// 构建期内复用字体读取，避免每张图重复读盘
let fontCache: Promise<ArrayBuffer> | null = null;
function loadFont(): Promise<ArrayBuffer> {
  if (!fontCache) {
    fontCache = readFile(join(process.cwd(), "assets/fonts/NotoSansSC.ttf")).then((b) => {
      // Buffer 可能基于更大的底层 ArrayBuffer，截取精确视图片段
      return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
    });
  }
  return fontCache;
}

export async function buildOgImage({
  title,
  eyebrow,
}: {
  title: string;
  eyebrow?: string;
}) {
  const fontData = await loadFont();

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
          color: "white",
          padding: "72px 80px",
          fontFamily: "Noto",
        }}
      >
        {/* 顶部品牌行 */}
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
              fontWeight: 800,
            }}
          >
            A
          </div>
          <div style={{ fontSize: "34px", fontWeight: 800, letterSpacing: "0.5px" }}>
            AooBee
          </div>
        </div>

        {/* 中部标题区 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
          }}
        >
          {eyebrow ? (
            <div
              style={{
                fontSize: "30px",
                color: "#93c5fd",
                marginBottom: "18px",
                fontWeight: 600,
              }}
            >
              {eyebrow}
            </div>
          ) : null}
          <div style={{ fontSize: "64px", fontWeight: 800, lineHeight: 1.18 }}>{title}</div>
        </div>

        {/* 底部说明 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "24px",
            color: "#cbd5e1",
          }}
        >
          <div>全行业产品 · 工具与服务目录</div>
          <div style={{ color: "#93c5fd" }}>www.aoobee.com</div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [{ name: "Noto", data: fontData, style: "normal", weight: 400 }],
    }
  );
}
