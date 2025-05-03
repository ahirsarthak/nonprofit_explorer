import { useState } from "react";

export default function ContactDevModal({ open, onClose, onSubmit, submitting, error, success }) {
  const [form, setForm] = useState({ name: "", email: "", linkedin: "", thoughts: "" });
  const [touched, setTouched] = useState({});
  const [showThanks, setShowThanks] = useState(false);

  // Validation helpers
  const isValidEmail = (email) => /.+@.+\..+/.test(email);
  const isValidLinkedIn = (url) => {
    if (!url) return true;
    return /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[A-Za-z0-9\-_%]+\/?$/.test(url.trim());
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setTouched({ ...touched, [e.target.name]: true });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !isValidEmail(form.email) || !isValidLinkedIn(form.linkedin)) return;
    onSubmit(form);
    setForm({ name: "", email: "", linkedin: "", thoughts: "" });
    setTouched({});
    setShowThanks(true);
    setTimeout(() => { setShowThanks(false); onClose(); }, 1600);
  };

  const isValid = form.name.trim() && form.email.trim() && isValidEmail(form.email) && isValidLinkedIn(form.linkedin);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
<div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6 relative">
<button
  className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-2xl z-10"
  onClick={onClose}
  aria-label="Close Contact"
>
  &times;
</button>
        <h2 className="text-xl font-bold mb-4 text-blue-700">Contact Sarthak</h2>
        {showThanks ? (
          <div className="flex flex-col items-center justify-center py-8">
            <span className="text-green-700 font-semibold text-lg">Thanks for your thoughts!</span>
          </div>
        ) : (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium">Name <span className="text-red-500">*</span></label>
            <input name="name" value={form.name} onChange={handleChange} className="mt-1 px-3 py-2 border rounded w-full" placeholder="Name" required />
            {touched.name && !form.name.trim() && <span className="text-xs text-red-500">Name is required.</span>}
          </div>
          <div>
            <label className="block text-sm font-medium">Email <span className="text-red-500">*</span></label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="mt-1 px-3 py-2 border rounded w-full" placeholder="some.email@email.com" required />
            {touched.email && !form.email.trim() && <span className="text-xs text-red-500">Email is required.</span>}
            {touched.email && form.email && !isValidEmail(form.email) && <span className="text-xs text-red-500">Enter a valid email.</span>}
          </div>
          <div>
            <label className="block text-sm font-medium">LinkedIn</label>
            <input name="linkedin" value={form.linkedin} onChange={handleChange} className="mt-1 px-3 py-2 border rounded w-full" placeholder="https://linkedin.com/in/some.profile" />
            {touched.linkedin && form.linkedin && !isValidLinkedIn(form.linkedin) && <span className="text-xs text-red-500">Enter a valid LinkedIn profile URL (e.g. linkedin.com/in/yourname).</span>}
          </div>
          <div>
            <label className="block text-sm font-medium">Thoughts</label>
            <textarea name="thoughts" value={form.thoughts} onChange={handleChange} className="mt-1 px-3 py-2 border rounded w-full" rows={3} placeholder="Your feedback or questions..." />
          </div>
          <button type="submit" className="bg-blue-700 text-white px-4 py-2 rounded mt-2 disabled:opacity-60" disabled={!isValid || submitting}>
            {submitting ? "Sending..." : "Send"}
          </button>
          {error && <div className="text-xs text-red-500 mt-1">{error}</div>}
          {success && <div className="text-xs text-green-600 mt-1">Thank you for your feedback!</div>}
        </form>
        )}
      </div>
    </div>
  );
}
