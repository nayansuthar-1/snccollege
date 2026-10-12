import 'server-only';
import Image from 'next/image';
import Link from 'next/link';
import parse, { attributesToProps, domToReact, Element, type DOMNode, type HTMLReactParserOptions } from 'html-react-parser';
import VideoEmbed from '@/components/page/VideoEmbed';

/**
 * WordPress HTML → React (Plan Phase 4, task 4).
 * - strips <script>, <style>, inline style attributes and on* handlers
 * - rewrites links to the WordPress host into site paths (uploads stay on the media host)
 * - renders images through next/image when dimensions are known
 * - wraps bare tables in a horizontal scroll container
 */

const WP_ORIGIN = (() => {
  try {
    return new URL(process.env.WORDPRESS_URL ?? '').origin;
  } catch {
    return '';
  }
})();

const ALLOWED_IFRAME_HOSTS = ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com', 'www.google.com', 'maps.google.com'];

const YOUTUBE_HOSTS = ['www.youtube.com', 'youtube.com', 'm.youtube.com', 'www.youtube-nocookie.com', 'youtu.be'];

/** YouTube video id from a watch, embed, short or youtu.be URL; null for anything else (a channel URL, say). */
export function youTubeId(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (!YOUTUBE_HOSTS.includes(parsed.hostname)) return null;

  const fromQuery = parsed.searchParams.get('v');
  const path = parsed.pathname.replace(/^\/+/, '');
  const fromPath = /^(embed|v|shorts)\//.test(path) ? path.split('/')[1] : parsed.hostname === 'youtu.be' ? path : '';
  const id = fromQuery || fromPath;
  return /^[\w-]{11}$/.test(id) ? id : null;
}

function cleanAttribs(attribs: Record<string, string>) {
  const out: Record<string, string> = {};
  for (const [name, value] of Object.entries(attribs)) {
    if (name === 'style' || name.startsWith('on')) continue;
    if ((name === 'href' || name === 'src') && /^\s*(javascript|data|vbscript):/i.test(value)) continue;
    out[name] = value;
  }
  return out;
}

/** WordPress-host URL → site path; uploads and other hosts unchanged. */
export function rewriteHref(href: string): string {
  if (!WP_ORIGIN || !href.startsWith(WP_ORIGIN)) return href;
  const url = new URL(href);
  if (url.pathname.startsWith('/wp-content/')) return href;
  const path = url.pathname.replace(/\/+$/, '') || '/';
  return `${path}${url.search}${url.hash}`;
}

function isInsideFigureTable(node: Element) {
  const parent = node.parent;
  return parent instanceof Element && parent.name === 'figure';
}

/** True when the node is the only meaningful content of its parent (ignoring whitespace). */
function isOnlyChild(node: Element) {
  const siblings = (node.parent as Element | null)?.children ?? [];
  return siblings.every((child) => child === node || (child.type === 'text' && !(child as unknown as Text).data?.trim()));
}

function textOf(node: Element): string {
  return node.children
    .map((child) => (child.type === 'text' ? ((child as unknown as Text).data ?? '') : child instanceof Element ? textOf(child) : ''))
    .join('')
    .trim();
}

const options: HTMLReactParserOptions = {
  replace(domNode) {
    if (!(domNode instanceof Element)) return undefined;
    const { name } = domNode;
    const attribs = cleanAttribs(domNode.attribs);
    const children = () => domToReact(domNode.children as DOMNode[], options);

    if (name === 'script' || name === 'style' || name === 'noscript' || name === 'form' || name === 'object' || name === 'embed') {
      return <></>;
    }

    if (name === 'iframe') {
      try {
        const host = new URL(attribs.src ?? '').hostname;
        if (!ALLOWED_IFRAME_HOSTS.includes(host)) return <></>;
      } catch {
        return <></>;
      }
      // YouTube becomes a click-to-load thumbnail so no Google request is made until the visitor asks.
      const videoId = youTubeId(attribs.src ?? '');
      if (videoId) return <VideoEmbed videoId={videoId} title={attribs.title || 'College video'} />;
      return (
        <iframe
          src={attribs.src}
          title={attribs.title || 'Embedded content'}
          loading="lazy"
          allowFullScreen
          className="my-8 aspect-video w-full rounded-xl border-0"
        />
      );
    }

    if (name === 'a' && attribs.href) {
      // A YouTube video link that is the whole paragraph is an embed, not a sentence link.
      const videoId = youTubeId(attribs.href);
      if (videoId && isOnlyChild(domNode)) {
        return <VideoEmbed videoId={videoId} title={textOf(domNode) || 'College video'} />;
      }
      const href = rewriteHref(attribs.href);
      const props = attributesToProps(attribs);
      delete props.href;
      if (href.startsWith('/') && !href.startsWith('//') && !href.startsWith('/wp-content/')) {
        return (
          <Link href={href} {...props}>
            {children()}
          </Link>
        );
      }
      const external = /^https?:\/\//.test(href);
      return (
        <a href={href} {...props} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
          {children()}
          {external && <span className="sr-only"> (opens in new tab)</span>}
        </a>
      );
    }

    if (name === 'img' && attribs.src) {
      const width = Number(attribs.width);
      const height = Number(attribs.height);
      const src = attribs.src;
      const fromWp = WP_ORIGIN !== '' && src.startsWith(`${WP_ORIGIN}/wp-content/uploads/`);
      if (fromWp && width > 0 && height > 0) {
        return <Image src={src} alt={attribs.alt ?? ''} width={width} height={height} sizes="(min-width: 1024px) 768px, 100vw" className="h-auto w-full" />;
      }
      // Fallback for images without dimensions (allowed raw <img>, see Plan Phase 4 task 4).
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={src} alt={attribs.alt ?? ''} loading="lazy" decoding="async" />;
    }

    if (name === 'table' && !isInsideFigureTable(domNode)) {
      return (
        <div className="table-scroll">
          <table {...attributesToProps(attribs)}>{children()}</table>
        </div>
      );
    }

    // Generic element: re-render with cleaned attributes (drops style/on*).
    if (attribs !== domNode.attribs && (domNode.attribs.style !== undefined || Object.keys(domNode.attribs).some((a) => a.startsWith('on')))) {
      domNode.attribs = attribs;
    }
    return undefined;
  },
};

export function renderWpHtml(html: string) {
  if (!html) return null;
  return parse(html, options);
}
