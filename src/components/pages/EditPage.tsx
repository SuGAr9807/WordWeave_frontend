import { useState, useEffect } from "react";
import Editor from "@/components/common/Editor";
import { useParams, useNavigate } from "react-router-dom";

const EditPage = () => {
  const { blog_id } = useParams<{ blog_id: string }>();
  const navigate = useNavigate();
  
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
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    // Fetch both tags and article data if we have an ID
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
    
    const fetchArticle = async () => {
      if (!blog_id) return;
      
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Authentication required. Please log in.');
        
        const response = await fetch(`http://127.0.0.1:8000/blogs-list/${blog_id}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch article data');
        }
        
        const data = await response.json();
        
        setArticle({
          title: data.title,
          content: data.content,
          tags: data.tags.map(tag => String(tag.tag_id)),
          image: null // We can't set the file object from an existing URL
        });
        
        setCode(data.content);
        
        if (data.image_url) {
          setImagePreview(data.image_url);
        }
        
      } catch (error) {
        console.error("Error fetching article:", error);
        setMessage({ text: error.message || "Failed to load article data", type: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
    fetchArticle();
  }, [blog_id]);

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

      // Use PUT for update instead of POST for create
      const response = await fetch(`http://127.0.0.1:8000/blogs-update/${blog_id}/`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update blog post');
      }

      setMessage({ text: "Article updated successfully!", type: "success" });
      
      // Redirect after successful update
      setTimeout(() => {
        navigate(`/blogs/${blog_id}`);
      }, 1500);
      
    } catch (error) {
      setMessage({ text: error.message || "An unexpected error occurred", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && blog_id) {
    return (
      <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg mt-5">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-6 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-32 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-64 bg-gray-200 rounded w-full mb-6"></div>
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg mt-5">
      <h2 className="text-2xl font-bold mb-6">Edit Blog Post</h2>
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
        {imagePreview && (
          <div className="mt-2 relative">
            <img src={imagePreview} alt="Preview" className="h-32 object-cover rounded border border-gray-300" />
            <button
              onClick={() => {
                setImagePreview(null);
                setArticle(prev => ({ ...prev, image: null }));
              }}
              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
              title="Remove image"
            >
              ✕
            </button>
          </div>
        )}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
        <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-md">
          {availableTags.length > 0 ? availableTags.map(tag => (
            <label key={tag.tag_id} className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                value={tag.tag_id} 
                checked={article.tags.includes(String(tag.tag_id))} 
                onChange={handleTagChange} 
                className="rounded text-blue-600" 
              />
              <span>{tag.name}</span>
            </label>
          )) : <p className="text-gray-500 italic">Loading tags...</p>}
        </div>
      </div>
      <div className="mb-6">
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Content*</label>
        <Editor code={code} setCode={setCode} />
      </div>
      <div className="flex gap-4">
        <button 
          className={`px-4 py-2 rounded-md text-white font-medium ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`} 
          onClick={handleSubmit} 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Update Article'}
        </button>
        <button 
          className="px-4 py-2 rounded-md text-gray-600 border border-gray-300 hover:bg-gray-100" 
          onClick={() => navigate(-1)}
          disabled={isSubmitting}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditPage;