/* ============================================================
   Jack株式会社 — デザインカンプ インタラクション（vanilla JS / CDN依存ゼロ）
   本番では GSAP ScrollTrigger + Lenis へ置換。挙動仕様はここで確定。
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- 拡張性の核: 事業データは配列で一元管理 ----
     新規事業（例: 重機レンタル）を足すときは、この配列に1要素追加するだけで
     メガメニュー・トップの事業リスト/パネルすべてに反映される設計。 */
  var BUSINESSES = [
    { no: "01", slug: "telecom",        kanji: "繋", title: "通信販売代理店業務", short: "携帯・光回線の代理店業務",
      desc: "大手通信キャリアのイベント・代理店業務を通じ、店舗の実績向上に貢献。「繋ぐ」を事業の起点に。" },
    { no: "02", slug: "recruitment",    kanji: "育", title: "人材採用支援",       short: "採用活動の総合支援",
      desc: "求人設計から定着まで、企業の採用活動を総合的にサポートするパートナー。「育てる」で組織を支える。" },
    { no: "03", slug: "infrastructure", kanji: "護", title: "インフラ保守（清掃・修理）", short: "清掃・修理・設備保守",
      desc: "オフィス・店舗・住宅の設備修理と清掃で、安全で快適な環境を維持。「護る」で日常を支える。" },
    { no: "04", slug: "global-ec",      kanji: "越", title: "越境EC事業",          short: "海外向け通販事業",
      desc: "海外市場へ向けた越境ECで、日本の商品を世界へ。「越える」で地域を世界につなぐ。" }
  ];

  function $(s, c) { return (c || document).querySelector(s); }
  function $all(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  document.addEventListener("DOMContentLoaded", function () {
    renderBusinesses();
    initHeader();
    initReveal();
    initHero();
    initCounters();
    initMega();
    initDrawer();
  });

  /* ---- 事業リスト/パネル/メガメニューを配列から描画 ---- */
  function renderBusinesses() {
    var list = $("#bizList"), panel = $("#bizPanel"), mega = $("#megaGrid");
    if (list) list.innerHTML = BUSINESSES.map(function (b, i) {
      return '<div class="biz-item' + (i === 0 ? ' active' : '') + '" data-idx="' + i + '">' +
        '<span class="no">' + b.no + '</span><span class="ttl">' + b.title + '</span>' +
        '<span class="kanji">' + b.kanji + '</span></div>';
    }).join("");
    if (panel) panel.innerHTML = BUSINESSES.map(function (b, i) {
      return '<article class="biz-pane' + (i === 0 ? ' active' : '') + '" data-idx="' + i + '">' +
        '<div class="bg"></div><span class="bigkanji">' + b.kanji + '</span>' +
        '<div class="inner"><span class="pno">' + b.no + ' / BUSINESS</span>' +
        '<h3>' + b.title + '</h3><p>' + b.desc + '</p>' +
        '<a class="link-more" href="business.html#' + b.slug + '">詳しく見る' + arrow() + '</a></div></article>';
    }).join("");
    if (mega) mega.innerHTML = BUSINESSES.map(function (b) {
      return '<a class="mega-card" href="business.html#' + b.slug + '">' +
        '<span class="no">' + b.no + '</span><h4>' + b.title + '</h4><p>' + b.short + '</p></a>';
    }).join("");

    // 左リスト ⇄ 右パネルの連動（ホバー/クリックでアクティブ切替）
    var items = $all(".biz-item"), panes = $all(".biz-pane");
    function activate(idx) {
      items.forEach(function (el, i) { el.classList.toggle("active", i === idx); });
      panes.forEach(function (el, i) { el.classList.toggle("active", i === idx); });
    }
    items.forEach(function (el) {
      var idx = +el.dataset.idx;
      el.addEventListener("mouseenter", function () { activate(idx); });
      el.addEventListener("click", function () { activate(idx); });
    });
  }
  function arrow() { return '<svg class="arrow" width="20" height="10" viewBox="0 0 20 10" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M0 5h18M14 1l4 4-4 4"/></svg>'; }

  /* ---- ヘッダー: スクロールで縮小＋背景 ---- */
  function initHeader() {
    var h = $(".site-header");
    if (!h) return;
    var onScroll = function () { h.classList.toggle("scrolled", window.scrollY > 40); };
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- スクロール入場フェード（IntersectionObserver） ---- */
  function initReveal() {
    var els = $all(".reveal");
    if (reduce || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("is-visible"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); } });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---- ヒーロー: 行リビール + 弱いパララックス ---- */
  function initHero() {
    var hero = $(".hero");
    if (!hero) return;
    requestAnimationFrame(function () { setTimeout(function () { hero.classList.add("in"); }, 120); });
    if (reduce) return;
    var bg = $(".hero-bg");
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      if (y < window.innerHeight && bg) bg.style.transform = "translateY(" + (y * 0.12) + "px)";
    }, { passive: true });
  }

  /* ---- 数字カウントアップ（入場時1回） ---- */
  function initCounters() {
    var nums = $all("[data-count]");
    if (!nums.length) return;
    if (reduce || !("IntersectionObserver" in window)) { nums.forEach(function (n) { n.firstChild && (n.childNodes[0].nodeValue = n.dataset.count); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { countUp(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { io.observe(n); });
  }
  function countUp(el) {
    var target = +el.dataset.count, dur = 1400, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
      el.childNodes[0].nodeValue = Math.round(target * eased).toString();
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---- メガメニュー（BUSINESS ホバー/フォーカス） ---- */
  function initMega() {
    var trigger = $("#megaTrigger"), mega = $("#mega");
    if (!trigger || !mega) return;
    var open = function () { mega.classList.add("open"); }, close = function () { mega.classList.remove("open"); };
    trigger.addEventListener("mouseenter", open);
    trigger.addEventListener("focus", open);
    mega.addEventListener("mouseleave", close);
    trigger.addEventListener("mouseleave", function (e) { if (!mega.contains(e.relatedTarget)) setTimeout(function () { if (!mega.matches(":hover")) close(); }, 80); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  /* ---- モバイルドロワー ---- */
  function initDrawer() {
    var burger = $(".burger");
    if (!burger) return;
    burger.addEventListener("click", function () {
      document.body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", document.body.classList.contains("menu-open"));
    });
    $all(".drawer a").forEach(function (a) { a.addEventListener("click", function () { document.body.classList.remove("menu-open"); }); });
  }
})();
