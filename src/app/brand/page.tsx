import type { Metadata } from "next";
import Link from "next/link";
import styles from "./brand.module.css";

export const metadata: Metadata = {
  title: "买过｜把每一次购买留在记忆里",
  description: "一个安静记录购买、感受与复购决定的私人购物记忆库。",
};

export default function BrandPage() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  return <main className={styles.page}>
    <nav className={styles.nav} aria-label="品牌导航">
      <Link className={styles.wordmark} href="/brand/">买过</Link>
      <Link className={styles.enter} href="/">打开应用 <ArrowIcon /></Link>
    </nav>

    <section className={styles.hero}>
      <p className={styles.kicker}>PRIVATE PURCHASE ARCHIVE</p>
      <h1>买过的，<br />都值得被记住。</h1>
      <p className={styles.intro}>把吃过、用过、喜欢过和不想再买的，都留下一句真实感受。下一次购买，不必重新猜。</p>
      <a className={styles.download} href={`${basePath}/downloads/bought-android-debug.apk`} download>
        <DownloadIcon /> 下载 Android 版
      </a>
      <p className={styles.note}>Android · 本地保存 · 无需登录</p>
    </section>

    <section className={styles.previewSection} aria-labelledby="preview-title">
      <div className={styles.previewHeading}><p className={styles.kicker}>A QUIET PLACE TO REMEMBER</p><h2 id="preview-title">不是清单，是你的购买判断。</h2></div>
      <div className={styles.phone} aria-label="买过应用界面预览">
        <div className={styles.phoneTop}><span>买过</span><span>7 件记录</span></div>
        <p className={styles.phoneTitle}>最近记录</p>
        <div className={styles.productRow}><div className={styles.productImage} /><div><strong>桂花酒酿酸奶</strong><p>会复购 · 4 星</p><span>甜度刚好，桂花很轻。</span></div></div>
        <div className={styles.productRow}><div className={`${styles.productImage} ${styles.imageTwo}`} /><div><strong>羊绒针织开衫</strong><p>再看看 · 3 星</p><span>版型好，但起球有点快。</span></div></div>
        <div className={styles.phoneRule} />
        <p className={styles.phonePrompt}>用过以后，回来留一句感受吧。</p>
      </div>
    </section>

    <section className={styles.values}>
      <div><span>01</span><h2>记得住</h2><p>照片、品牌、价格和购买渠道，下一次一眼认出来。</p></div>
      <div><span>02</span><h2>说得清</h2><p>给一颗星，写一句感受。喜欢与否不必只靠记忆。</p></div>
      <div><span>03</span><h2>买得准</h2><p>明确标记会不会复购，让每一次选择都有依据。</p></div>
    </section>

    <footer className={styles.footer}><span>买过 · 你的私人购物记忆库</span><a href={`${basePath}/downloads/bought-android-debug.apk`} download>下载 Android 版</a></footer>
  </main>;
}

function ArrowIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>; }
function DownloadIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" /></svg>; }
