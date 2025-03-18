import { useState, useEffect } from "react";
import Editor from "@/components/common/Editor";

const ArticleEditor = () => {
  const [code, setCode] = useState("");
  const [article, setArticle] = useState({
    title: "",
    content: "",
    tags: [],
    image: null
  });
  const [availableTags, setAvailableTags] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/list-tags/');
        if (!response.ok) {
          throw new Error('Failed to fetch tags');
        }
        const data = await response.json();
        setAvailableTags(data);
      } catch (error) {
        console.error("Error fetching tags:", error);
        setMessage({ text: "Failed to load tags. Please refresh.", type: "error" });
      }
    };
    fetchTags();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArticle(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTagChange = (e) => {
    const tagId = String(e.target.value);
    setArticle(prev => ({
      ...prev,
      tags: e.target.checked 
        ? [...prev.tags, tagId] 
        : prev.tags.filter(id => id !== tagId)
    }));
  };

  const handleChange = (e) => {
    setArticle(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    setArticle(prev => ({ ...prev, content: code }));
  }, [code]);

  const handleSubmit = async () => {
    if (!article.title.trim()) {
      setMessage({ text: "Title is required", type: "error" });
      return;
    }
    if (!article.content.trim()) {
      setMessage({ text: "Content is required", type: "error" });
      return;
    }

    setIsSubmitting(true);
    setMessage({ text: "", type: "" });
    try {
      const formData = new FormData();
      formData.append('title', article.title);
      formData.append('content', article.content);
      article.tags.forEach(tagId => formData.append('tags', tagId));
      if (article.image) {
        formData.append('image_url', article.image);
      }

      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Authentication required. Please log in.');

      const response = await fetch('http://127.0.0.1:8000/blogs-create/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create blog post');
      }

      setMessage({ text: "Article published successfully!", type: "success" });
      setArticle({ title: "", content: "", tags: [], image: null });
      setCode("");
      setImagePreview(null);
    } catch (error) {
      setMessage({ text: error.message || "An unexpected error occurred", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg mt-5">
      <h2 className="text-2xl font-bold mb-6">Create New Blog Post</h2>
      {message.text && (
        <div className={`p-3 mb-4 rounded ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message.text}
        </div>
      )}
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
        <input
          type="text"
          id="title"
          name="title"
          value={article.title}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter article title"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
        <input type="file" accept="image/*" onChange={handleImageChange} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
        {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 h-32 object-cover rounded border border-gray-300" />}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
        <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-md">
          {availableTags.length > 0 ? availableTags.map(tag => (
            <label key={tag.tag_id} className="flex items-center space-x-2">
              <input type="checkbox" value={tag.tag_id} checked={article.tags.includes(String(tag.tag_id))} onChange={handleTagChange} className="rounded text-blue-600" />
              <span>{tag.name}</span>
            </label>
          )) : <p className="text-gray-500 italic">Loading tags...</p>}
        </div>
      </div>
      <div className="mb-6">
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Content*</label>
        <Editor code={code} setCode={setCode} />
      </div>
      <button className={`px-4 py-2 rounded-md text-white font-medium ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`} onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? 'Publishing...' : 'Publish Article'}
      </button>
    </div>
  );
};

export default ArticleEditor;
