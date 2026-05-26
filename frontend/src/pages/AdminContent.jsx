import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, ArrowLeft, Trash2, Save, Loader2 } from "lucide-react";
import {
  adminMe,
  adminListExperiences,
  adminCreateExperience,
  adminUpdateExperience,
  adminDeleteExperience,
  adminListTestimonials,
  adminCreateTestimonial,
  adminUpdateTestimonial,
  adminDeleteTestimonial,
  adminListBlogPosts,
  adminCreateBlogPost,
  adminUpdateBlogPost,
  adminDeleteBlogPost,
} from "../lib/api";
import { toast } from "sonner";
import { setAuthToken } from "../lib/api";

const SECTIONS = [
  { key: "experiences", label: "Experiences" },
  { key: "blog", label: "Blog Posts" },
  { key: "testimonials", label: "Testimonials" },
];

const SECTION_CONFIG = {
  experiences: {
    keyField: "id",
    titleKey: "name",
    list: adminListExperiences,
    create: adminCreateExperience,
    update: adminUpdateExperience,
    remove: adminDeleteExperience,
    fields: [
      { name: "id", label: "ID", type: "text", hint: "Unique identifier for the experience" },
      { name: "name", label: "Name", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "image", label: "Image URL", type: "text" },
      { name: "price_from", label: "Price From", type: "number" },
    ],
    createDefaults: { id: "", name: "", description: "", image: "", price_from: 0 },
  },
  blog: {
    keyField: "slug",
    titleKey: "title",
    list: adminListBlogPosts,
    create: adminCreateBlogPost,
    update: adminUpdateBlogPost,
    remove: adminDeleteBlogPost,
    fields: [
      { name: "slug", label: "Slug", type: "text", hint: "URL identifier (e.g. best-areas-to-stay-in-bali)" },
      { name: "title", label: "Title", type: "text" },
      { name: "category", label: "Category", type: "text" },
      { name: "excerpt", label: "Excerpt", type: "textarea" },
      { name: "cover", label: "Cover Image URL", type: "text" },
      { name: "author", label: "Author", type: "text" },
      { name: "author_role", label: "Author Role", type: "text" },
      { name: "read_time", label: "Read Time", type: "number" },
      { name: "date", label: "Date", type: "text" },
      { name: "content", label: "Content", type: "textarea" },
    ],
    createDefaults: { slug: "", title: "", category: "", excerpt: "", cover: "", author: "", author_role: "", read_time: 0, date: "", content: "" },
  },
  testimonials: {
    keyField: "name",
    titleKey: "name",
    list: adminListTestimonials,
    create: adminCreateTestimonial,
    update: adminUpdateTestimonial,
    remove: adminDeleteTestimonial,
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "country", label: "Country", type: "text" },
      { name: "rating", label: "Rating", type: "number" },
      { name: "photo", label: "Photo URL", type: "text" },
      { name: "review", label: "Review", type: "textarea" },
    ],
    createDefaults: { name: "", country: "", rating: 5, photo: "", review: "" },
  },
};

export default function AdminContent() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [section, setSection] = useState(SECTIONS[0].key);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState(null);
  const [form, setForm] = useState({});
  const [isNew, setIsNew] = useState(false);

  const config = SECTION_CONFIG[section];

  useEffect(() => {
    adminMe()
      .then(setAdmin)
      .catch(() => {
        setAuthToken(null);
        navigate("/admin/login");
      });
  }, [navigate]);

  useEffect(() => {
    if (!admin) return;
    loadSection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, section]);

  const loadSection = async () => {
    setLoading(true);
    setSelectedKey(null);
    setForm({});
    setIsNew(false);
    try {
      const data = await config.list();
      setItems(data);
    } catch (error) {
      toast.error("Could not load content.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item) => {
    setSelectedKey(item[config.keyField]);
    setForm(item);
    setIsNew(false);
  };

  const handleNew = () => {
    setSelectedKey(null);
    setForm({ ...config.createDefaults });
    setIsNew(true);
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveItem = async () => {
    try {
      if (isNew) {
        await config.create(form);
        toast.success(`${config.label.slice(0, -1)} created.`);
      } else {
        const key = selectedKey;
        await config.update(key, form);
        toast.success(`${config.label.slice(0, -1)} updated.`);
      }
      await loadSection();
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Save failed.");
    }
  };

  const deleteItem = async () => {
    if (!selectedKey) return;
    if (!window.confirm("Delete this item?")) return;
    try {
      await config.remove(selectedKey);
      toast.success(`${config.label.slice(0, -1)} deleted.`);
      await loadSection();
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Delete failed.");
    }
  };

  const headerTitle = useMemo(() => {
    return `${config.label} management`;
  }, [config.label]);

  if (!admin) return <div className="pt-40 container-luxe">Loading…</div>;

  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-black/5">
        <div className="container-luxe flex h-20 items-center justify-between gap-4">
          <div className="flex items-baseline gap-4">
            <Link to="/" className="font-serif text-2xl">Amara</Link>
            <span className="text-[10px] uppercase tracking-[0.32em] text-[#D4AF37]">Content Console</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-xs uppercase tracking-[0.28em] text-[#1A1A1A]/60 hover:text-[#1A1A1A]">
              Back to bookings
            </Link>
            <span className="hidden sm:inline text-xs text-[#1A1A1A]/60">{admin.email}</span>
          </div>
        </div>
      </header>

      <div className="container-luxe py-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="label-eyebrow">Admin content</p>
            <h1 className="mt-3 font-serif text-5xl tracking-tight">Edit website pages</h1>
            <p className="mt-3 text-sm text-[#1A1A1A]/60 max-w-xl">
              Manage dynamic content used by the homepage, experiences, blog, and testimonials.
            </p>
          </div>
          <button
            type="button"
            onClick={handleNew}
            className="inline-flex items-center gap-2 rounded-full bg-[#1A1A1A] px-5 py-3 text-sm text-white uppercase tracking-[0.24em] hover:bg-[#333] transition"
          >
            <Plus size={14} /> New {config.label.slice(0, -1)}
          </button>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {SECTIONS.map((sectionItem) => (
            <button
              key={sectionItem.key}
              onClick={() => setSection(sectionItem.key)}
              className={`rounded-full px-4 py-2 text-sm uppercase tracking-[0.24em] transition ${sectionItem.key === section ? "bg-[#1A1A1A] text-white" : "bg-white border border-black/10 text-[#1A1A1A]/70 hover:text-[#1A1A1A]"}`}
            >
              {sectionItem.label}
            </button>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8">
          <section>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-[#D4AF37]">{headerTitle}</p>
                <h2 className="mt-3 font-serif text-4xl">{config.label}</h2>
              </div>
              {loading && <div className="inline-flex items-center gap-2 text-sm text-[#1A1A1A]/60"><Loader2 className="animate-spin" size={16} /> Loading</div>}
            </div>

            <div className="mt-6 luxe-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F4F1EA] text-[10px] uppercase tracking-[0.24em] text-[#1A1A1A]/60">
                    <tr>
                      <th className="px-6 py-4 text-left">{config.titleKey}</th>
                      <th className="px-6 py-4 text-left">Identifier</th>
                      <th className="px-6 py-4 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item[config.keyField]} className="border-t border-black/5 hover:bg-[#FAFAFA] transition-colors">
                        <td className="px-6 py-4">{item[config.titleKey]}</td>
                        <td className="px-6 py-4"><span className="font-mono text-xs text-[#1A1A1A]/70">{item[config.keyField]}</span></td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => handleSelect(item)}
                            className="text-xs uppercase tracking-[0.28em] text-[#D4AF37] hover:text-[#1A1A1A]"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && !loading && (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-sm text-[#1A1A1A]/60">No items found for this section.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="luxe-card p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[#1A1A1A]/50">Editor</p>
                  <h3 className="mt-3 font-serif text-2xl">{isNew ? `Create ${config.label.slice(0, -1)}` : `Edit ${config.label.slice(0, -1)}`}</h3>
                </div>
                <span className="text-xs text-[#1A1A1A]/50">{selectedKey || "new item"}</span>
              </div>

              <div className="mt-6 space-y-4">
                {config.fields.map((field) => (
                  <div key={field.name}>
                    <label className="text-[11px] uppercase tracking-[0.28em] text-[#1A1A1A]/60 block mb-2">{field.label}</label>
                    {field.type === "textarea" ? (
                      <textarea
                        value={form[field.name] || ""}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        rows={field.name === "content" ? 6 : 3}
                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37]"
                        disabled={!isNew && field.name === config.keyField}
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={form[field.name] ?? ""}
                        onChange={(e) => handleChange(field.name, field.type === "number" ? Number(e.target.value) : e.target.value)}
                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37]"
                        disabled={!isNew && field.name === config.keyField}
                      />
                    )}
                    {field.hint && <p className="mt-1 text-xs text-[#1A1A1A]/50">{field.hint}</p>}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={saveItem}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1A1A1A] px-5 py-3 text-sm text-white uppercase tracking-[0.24em] hover:bg-[#333] transition"
                >
                  <Save size={14} /> Save
                </button>
                {!isNew && selectedKey && (
                  <button
                    type="button"
                    onClick={deleteItem}
                    className="inline-flex items-center gap-2 rounded-full bg-[#FDECEF] px-5 py-3 text-sm text-[#D42C3A] uppercase tracking-[0.24em] hover:bg-[#FBD7D9] transition"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                )}
              </div>
            </div>

            <div className="luxe-card p-7 bg-[#F4F1EA]">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#1A1A1A]/50">Help</p>
              <p className="mt-3 text-sm text-[#1A1A1A]/80 leading-relaxed">
                Use the editor to update the website's top content blocks. Create new items for fresh experiences, blog posts or testimonials, and edit existing records directly from the admin console.
              </p>
              <div className="mt-4 space-y-2 text-xs text-[#1A1A1A]/60">
                <p><span className="font-semibold">Experiences</span> power the /experiences page.</p>
                <p><span className="font-semibold">Blog posts</span> populate /blog and article pages.</p>
                <p><span className="font-semibold">Testimonials</span> appear on the homepage and booking flows.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
