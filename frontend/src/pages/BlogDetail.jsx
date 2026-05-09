import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Clock, ChevronLeft, Twitter, Facebook, Linkedin, Link as LinkIcon } from "lucide-react";
import { fetchBlogPost, fetchBlog } from "../lib/api";
import { toast } from "sonner";

export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    fetchBlogPost(slug).then((p) => {
      setPost(p);
      fetchBlog({ category: p.category }).then((all) => setRelated(all.filter((x) => x.slug !== p.slug).slice(0, 3)));
    });
  }, [slug]);

  if (!post) return <div className="pt-40 container-luxe">Loading…</div>;

  const url = typeof window !== "undefined" ? window.location.href : "";

  return (
    <article data-testid="blog-detail-page">
      <div className="relative h-[70vh] w-full overflow-hidden">
        <img src={post.cover} alt={post.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/40" />
        <div className="absolute inset-0 flex items-end">
          <div className="container-luxe pb-16 text-white">
            <Link to="/blog" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/80 hover:text-[#D4AF37]">
              <ChevronLeft size={14} /> Journal
            </Link>
            <p className="mt-6 text-xs uppercase tracking-[0.32em] text-[#D4AF37]">{post.category}</p>
            <h1 className="mt-4 font-serif text-4xl sm:text-6xl leading-[1.05] tracking-tight max-w-4xl">{post.title}</h1>
            <div className="mt-6 flex items-center gap-6 text-sm">
              <span>{post.author}</span>
              <span className="text-white/60">·</span>
              <span className="text-white/80">{post.author_role}</span>
              <span className="text-white/60">·</span>
              <span className="flex items-center gap-1.5 text-white/80"><Clock size={13} /> {post.read_time} min read</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-luxe mt-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <aside className="lg:col-span-2">
          <div className="lg:sticky lg:top-32 space-y-4">
            <p className="text-[10px] uppercase tracking-[0.32em] text-[#1A1A1A]/50">Share</p>
            <div className="flex lg:flex-col gap-3">
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"><Twitter size={14} /></a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"><Facebook size={14} /></a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"><Linkedin size={14} /></a>
              <button onClick={() => { navigator.clipboard.writeText(url); toast.success("Link copied"); }} className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"><LinkIcon size={14} /></button>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-8">
          <p className="font-serif text-2xl italic text-[#1A1A1A]/80 leading-relaxed">{post.excerpt}</p>
          <div className="mt-10 prose prose-lg max-w-none article-content">
            {post.content.split("\n\n").map((para, i) => {
              if (para.startsWith("## ")) {
                return <h2 key={i} className="mt-12 font-serif text-3xl">{para.replace("## ", "")}</h2>;
              }
              return <p key={i} className="mt-6 text-[#1A1A1A]/80 leading-[1.85]">{para}</p>;
            })}
          </div>

          <div className="mt-16 pt-10 border-t border-black/5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#F4F1EA] flex items-center justify-center font-serif text-xl">{post.author.split(" ").map((n) => n[0]).join("")}</div>
            <div>
              <p className="font-medium">{post.author}</p>
              <p className="text-xs uppercase tracking-[0.24em] text-[#1A1A1A]/60">{post.author_role}</p>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container-luxe mt-24">
          <p className="label-eyebrow">Related reading</p>
          <h2 className="mt-4 font-serif text-4xl">More from the journal</h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-7">
            {related.map((p) => (
              <Link key={p.slug} to={`/blog/${p.slug}`} className="group luxe-card block">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={p.cover} alt={p.title} className="w-full h-full object-cover img-zoom" />
                </div>
                <div className="p-7">
                  <p className="text-[10px] uppercase tracking-[0.32em] text-[#D4AF37]">{p.category}</p>
                  <h3 className="mt-4 font-serif text-xl">{p.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
